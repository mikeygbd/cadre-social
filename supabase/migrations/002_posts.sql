create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  content text not null check (char_length(content) <= 280),
  image_url text,
  created_at timestamptz default now() not null
);

alter table public.posts enable row level security;

create policy "posts viewable by everyone"
  on public.posts for select
  using (true);

create policy "authenticated users can insert posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "users can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id);
