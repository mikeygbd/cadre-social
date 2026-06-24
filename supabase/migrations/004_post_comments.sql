create table public.post_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

create index post_comments_post_id_created_at_idx
  on public.post_comments (post_id, created_at asc);

alter table public.post_comments enable row level security;

create policy "post_comments viewable by everyone"
  on public.post_comments for select
  using (true);

create policy "authenticated users can insert comments"
  on public.post_comments for insert
  with check (auth.uid() = user_id);

create policy "users can delete own comments"
  on public.post_comments for delete
  using (auth.uid() = user_id);
