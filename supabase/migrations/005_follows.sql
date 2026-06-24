create table public.follows (
  follower_id uuid references public.profiles on delete cascade not null,
  following_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

alter table public.follows enable row level security;

create policy "follows viewable by everyone"
  on public.follows for select
  using (true);

create policy "authenticated users can follow"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);
