create type public.notification_type as enum ('like', 'comment');

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid references public.profiles on delete cascade not null,
  actor_id uuid references public.profiles on delete cascade not null,
  type public.notification_type not null,
  post_id uuid references public.posts on delete cascade not null,
  read_at timestamptz,
  created_at timestamptz default now() not null
);

create index notifications_recipient_created_at_idx
  on public.notifications (recipient_id, created_at desc);

create index notifications_recipient_unread_idx
  on public.notifications (recipient_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "users can view own notifications"
  on public.notifications for select
  using (auth.uid() = recipient_id);

create policy "users can update own notifications"
  on public.notifications for update
  using (auth.uid() = recipient_id);

-- Like notifications (skip self-likes)
create or replace function public.handle_post_like_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner_id uuid;
begin
  select user_id into post_owner_id from public.posts where id = new.post_id;

  if post_owner_id is null or post_owner_id = new.user_id then
    return new;
  end if;

  insert into public.notifications (recipient_id, actor_id, type, post_id)
  values (post_owner_id, new.user_id, 'like', new.post_id);

  return new;
end;
$$;

create trigger on_post_like_create_notification
  after insert on public.post_likes
  for each row execute function public.handle_post_like_notification();

-- Comment notifications (skip self-comments)
create or replace function public.handle_post_comment_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner_id uuid;
begin
  select user_id into post_owner_id from public.posts where id = new.post_id;

  if post_owner_id is null or post_owner_id = new.user_id then
    return new;
  end if;

  insert into public.notifications (recipient_id, actor_id, type, post_id)
  values (post_owner_id, new.user_id, 'comment', new.post_id);

  return new;
end;
$$;

create trigger on_post_comment_create_notification
  after insert on public.post_comments
  for each row execute function public.handle_post_comment_notification();
