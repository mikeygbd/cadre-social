# Cadre Social — CLAUDE.md

## Project Overview
Minimal social network (Facebook circa 2004) built for the Cadre AI technical assessment.
Users can sign up, create a profile, post status updates, and see a feed of posts from other users.
Stretch goals: follows, likes, comments.

**Live URL:** [to be filled after deploy]
**Repo:** [to be filled after push]

---

## Stack
- **Framework:** Next.js 14 with App Router (not Pages Router)
- **Auth + Database:** Supabase (Auth, Postgres, Storage)
- **Styling:** Tailwind CSS only — no component libraries unless time permits
- **Deployment:** Vercel (auto-deploy on push to main)
- **Language:** TypeScript strict mode throughout

---

## File Structure
```
/app
  /(auth)           # Route group — no shared layout, standalone pages
    /login
    /signup
  /(main)           # Route group — shared layout with nav + auth check
    /feed           # Global feed + post composer
    /profile
      /[userId]     # Public profile page
      /edit         # Edit own profile
/components         # Shared UI components only
/lib
  /supabase
    client.ts       # Browser Supabase client
    server.ts       # Server-side Supabase client (cookies)
  types.ts          # All shared TypeScript types
/supabase
  /migrations       # Numbered SQL migration files
middleware.ts       # Edge auth session refresh + route protection
```

---

## Database Schema
```sql
profiles          -- id (ref auth.users), display_name, bio, avatar_url, created_at
posts             -- id, user_id (ref profiles), content (max 280), image_url, created_at
post_likes        -- (post_id, user_id) composite PK, created_at
post_comments     -- id, post_id, user_id, content, created_at
follows           -- (follower_id, following_id) composite PK, no self-follow constraint
```

All tables use Row Level Security (RLS). Profiles auto-created on signup via SECURITY DEFINER trigger.

---

## Coding Standards

**TypeScript**
- Strict mode — no `any` types, ever
- Explicit return types on all functions
- Use `type` for object shapes, `interface` only when extending

**React / Next.js**
- Server Components by default — only use `'use client'` when you need browser APIs or event handlers
- Data fetching in Server Components directly, never `useEffect` for initial data
- `router.refresh()` after mutations to re-fetch server data
- `loading.tsx` and `error.tsx` for every route that fetches data

**Async**
- Always `async/await`, never `.then()` chains
- Always handle errors explicitly — no silent catches
- Early returns over nested conditionals

**Naming**
- Components: PascalCase
- Functions and variables: camelCase
- Database columns: snake_case
- Files: kebab-case for pages, PascalCase for components

---

## What NOT To Do
- **No Pages Router** — this is App Router only, no `getServerSideProps`, no `getStaticProps`
- **No `useEffect` for data fetching** — use Server Components
- **No client components unless necessary** — check if a Server Component would work first
- **No inline styles** — Tailwind classes only
- **No skipping error states** — every fetch needs an error path
- **No skipping loading states** — every async route needs `loading.tsx`
- **No committing `.env.local`** — it is in `.gitignore`, keep it there
- **No nested Supabase joins** — use separate queries joined in memory (PostgREST joins fail silently)
- **No optimistic UI except on LikeButton** — use `router.refresh()` for simplicity everywhere else

---

## Domain Parallel Patterns
When tasks are independent, spawn parallel subagents rather than working sequentially.

**Frontend Agent** — owns `/app` UI files and `/components`
**Backend Agent** — owns `/lib` helpers and API logic
**Database Agent** — owns `/supabase/migrations` and schema SQL

Example parallel dispatch:
> "Use parallel subagents: Agent 1 builds the signup page and login page. Agent 2 writes the profiles and posts migration SQL with RLS policies."

Do not parallelize tasks that share files or depend on each other's output.

---

## Auth Pattern
- `middleware.ts` runs at Edge on every request — refreshes session, protects `/feed` and `/profile` routes
- `lib/supabase/server.ts` for all server-side Supabase calls (Server Components, Server Actions)
- `lib/supabase/client.ts` for all browser-side calls (Client Components only)
- Never use the service role key client-side

---

## RLS Policy Pattern
Every table follows this pattern:
```sql
alter table public.table_name enable row level security;
-- Public read
create policy "table_name viewable by everyone" on public.table_name for select using (true);
-- Authenticated insert as self
create policy "authenticated users can insert" on public.table_name for insert
  with check (auth.uid() = user_id);
-- Owner can update/delete
create policy "users can update own rows" on public.table_name for update
  using (auth.uid() = user_id);
```

---

## Phase Completion Criteria
Do not move to the next phase until the current one is verified working in the browser.
Small commits with descriptive messages after each working checkpoint.
Deploy to Vercel within 60 minutes of first commit — do not wait until the end.
