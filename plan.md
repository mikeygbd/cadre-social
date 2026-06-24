# Cadre Social — Build Plan

**Total time:** 2 hours from first git commit
**Target:** Deployed MVP within 60 minutes, stretch features in remaining time
**Rule:** Nothing moves to next phase until current phase works end-to-end in the browser

---

## Phase 1 — Foundation (target: 20 min)

**Goal:** Running app deployed to Vercel with database connected.

**Parallel subagents:**
- Agent 1: Scaffold Next.js 14 project with Tailwind, install `@supabase/supabase-js` and `@supabase/ssr`, create `lib/supabase/client.ts`, `lib/supabase/server.ts`, and `middleware.ts` for session refresh and route protection
- Agent 2: Write all migration SQL — `profiles`, `posts`, `post_likes`, `post_comments`, `follows` tables with RLS policies and SECURITY DEFINER trigger for auto-profile on signup

**While agents run:**
- Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Run migration SQL in Supabase SQL Editor
- Disable email confirmation in Supabase Auth settings
- Create GitHub repo and link Vercel project

**Done criteria:**
- [ ] `npm run dev` runs without errors on localhost:3000
- [ ] Homepage renders with links to /login and /signup
- [ ] Supabase tables visible in dashboard
- [ ] First commit pushed and Vercel deploy succeeds
- [ ] Live URL is accessible

---

## Phase 2 — Auth (target: 20 min)

**Goal:** Users can sign up, log in, and log out. Session persists on refresh.

**Parallel subagents:**
- Agent 1: Build `/app/(auth)/signup/page.tsx` — display name + email + password form, calls Supabase signUp, redirects to /feed on success
- Agent 2: Build `/app/(auth)/login/page.tsx` — email + password form, calls signInWithPassword, redirects to /feed
- Agent 3: Build `(main)` route group with shared layout — session check, nav bar with Feed / Profile / Log out links

**Done criteria:**
- [ ] Sign up with new email creates auth user and profile row in Supabase
- [ ] Login redirects to /feed
- [ ] Logout redirects to /login
- [ ] Visiting /feed while logged out redirects to /login
- [ ] Session persists on page refresh
- [ ] Commit pushed, deploy verified on live URL

---

## Phase 3 — Core Features (target: 35 min)

**Goal:** Users can post, see a feed, and view profiles.

**Parallel subagents:**
- Agent 1: Build `/app/(main)/feed/page.tsx` (Server Component) — fetch all posts joined with profiles ordered newest first, render PostCard components. Build `components/PostCard.tsx` and `components/CreatePost.tsx` — CreatePost inserts to posts table and calls `router.refresh()`
- Agent 2: Build `/app/(main)/profile/[userId]/page.tsx` — show display name, bio, avatar, and that user's posts. Build `/app/(main)/profile/edit/page.tsx` — form to update display name and bio

**Done criteria:**
- [ ] Can type and submit a post from the feed
- [ ] Post appears in feed immediately after submit
- [ ] Feed shows posts from all users newest first
- [ ] Profile page shows user info and their posts
- [ ] Edit profile saves changes and reflects on profile page
- [ ] Commit pushed, deploy verified on live URL

---

## Phase 4 — Stretch Features (target: remaining time)

**Goal:** Add as many working stretch features as time allows. Do not break what is already working.

**Priority order — build in this sequence:**

**4a. Likes**
- Create `post_likes` migration if not already applied
- Build `components/LikeButton.tsx` — optimistic UI with useState, insert/delete on post_likes, revert on error
- Add like count and button to PostCard

**4b. Comments**
- Apply `post_comments` migration
- Build `components/CommentSection.tsx` — show existing comments, submit new comment, `router.refresh()` after insert
- Wire into PostCard below likes

**4c. Follows**
- Apply `follows` migration
- Build `components/FollowButton.tsx` on profile pages
- Show follower/following counts on profile
- Add followed users strip to feed (optional if time permits)

**4d. Polish (only if everything above is working)**
- Avatar upload to Supabase Storage
- `loading.tsx` skeletons for feed and profile
- `error.tsx` for feed and profile
- Responsive layout check on narrow screen

**Done criteria for each:**
- [ ] Feature works end to end without breaking anything already working
- [ ] Commit pushed after each working feature
- [ ] Live URL verified after each deploy

---

## Time Checkpoints

| Time elapsed | Where you should be |
|---|---|
| 15 min | Phase 1 done, first deploy live |
| 35 min | Auth working, can sign up and log in |
| 70 min | Feed and profiles working, posts visible |
| 90 min | At least likes working as stretch |
| 110 min | Final commit pushed, live URL clean |

---

## If Running Behind

- Cut stretch features entirely — a solid auth + feed + profiles beats broken likes
- Cut profile edit if needed — viewing a profile matters more than editing it
- Never cut the deploy — something live beats something local

## If Running Ahead

- Add likes, then comments, then follows in that order
- Add loading and error states
- Add avatar upload last — it is a rabbit hole

---

## Commit Message Convention
```
feat: scaffold next.js project with supabase auth
feat: add signup and login pages
feat: add feed page with post creation
feat: add user profile pages
feat: add post likes with optimistic ui
feat: add comments
feat: add follow system
fix: [description of what was broken]
```
