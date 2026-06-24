create table public.post_likes (
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "post_likes viewable by everyone"
  on public.post_likes for select
  using (true);

create policy "authenticated users can like posts"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

create policy "users can unlike their own likes"
  on public.post_likes for delete
  using (auth.uid() = user_id);
