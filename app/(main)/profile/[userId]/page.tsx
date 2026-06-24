import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/Avatar'
import PostCard from '@/components/PostCard'
import type { CommentWithProfile, Post, PostComment, PostLike, Profile } from '@/lib/types'
import FollowButton from '@/components/FollowButton'
import PostHashScroller from '@/components/notifications/PostHashScroller'
import {
  card,
  empty,
  layout,
  profile,
  typography,
} from '@/lib/styles'

export default async function ProfilePage({
  params,
}: {
  params: { userId: string }
}): Promise<JSX.Element> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.userId)
    .single()

  if (profileError || !profileData) notFound()

  const profileRecord: Profile = profileData

  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })

  if (postsError) throw new Error(postsError.message)

  const posts: Post[] = postsData ?? []
  const postIds = posts.map((p) => p.id)
  const isOwnProfile = user.id === params.userId

  const likesData: PostLike[] = []
  if (postIds.length > 0) {
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id, user_id, created_at')
      .in('post_id', postIds)
    if (error) throw new Error(error.message)
    likesData.push(...(data ?? []))
  }

  const commentsData: PostComment[] = []
  if (postIds.length > 0) {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .in('post_id', postIds)
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    commentsData.push(...(data ?? []))
  }

  const commentAuthorIds = [...new Set(commentsData.map((c) => c.user_id))]
  const profilesForComments: Profile[] = []
  if (commentAuthorIds.length > 0) {
    const missingIds = commentAuthorIds.filter((id) => id !== profileRecord.id && id !== user.id)
    if (missingIds.length > 0) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, bio, created_at')
        .in('id', missingIds)
      if (error) throw new Error(error.message)
      profilesForComments.push(...(data ?? []))
    }
  }

  const profileMap = new Map<string, Profile>([
    [profileRecord.id, profileRecord],
    ...profilesForComments.map((p) => [p.id, p] as const),
  ])

  let currentUserProfile = profileMap.get(user.id)
  if (!currentUserProfile) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, bio, created_at')
      .eq('id', user.id)
      .single()
    if (error || !data) throw new Error(error?.message ?? 'Profile not found.')
    currentUserProfile = data
    profileMap.set(user.id, data)
  }

  const enrichedComments: CommentWithProfile[] = commentsData.map((c) => {
    const cp = profileMap.get(c.user_id)
    return { ...c, display_name: cp?.display_name ?? null, avatar_url: cp?.avatar_url ?? null }
  })

  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', params.userId)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', params.userId)

  let isFollowing = false
  if (!isOwnProfile) {
    const { data: followRow } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', params.userId)
      .maybeSingle()
    isFollowing = !!followRow
  }

  return (
    <div>
      <PostHashScroller />
      <div className={`${card.paddedLg} mb-6`}>
        <div className={profile.header}>
          <div className={profile.headerInner}>
            <Avatar
              src={profileRecord.avatar_url}
              name={profileRecord.display_name}
              size="lg"
              priority
            />
            <div>
              <h1 className={typography.h2}>
                {profileRecord.display_name ?? 'Anonymous'}
              </h1>
              {profileRecord.bio && (
                <p className={`${typography.muted} text-sm mt-1`}>{profileRecord.bio}</p>
              )}
              <div className={profile.stats}>
                <span className={typography.stat}>
                  <span className={typography.statValue}>{posts.length}</span> posts
                </span>
                <span className={typography.stat}>
                  <span className={typography.statValue}>{followerCount ?? 0}</span> followers
                </span>
                <span className={typography.stat}>
                  <span className={typography.statValue}>{followingCount ?? 0}</span> following
                </span>
              </div>
            </div>
          </div>
          {isOwnProfile ? (
            <Link
              href="/profile/edit"
              className={profile.editBtn}
              aria-label="Edit profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={profile.editIcon}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </Link>
          ) : (
            <FollowButton targetUserId={params.userId} initialIsFollowing={isFollowing} />
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <p className={empty.message}>No posts yet.</p>
      ) : (
        <div className={layout.stack}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              profile={profileRecord}
              currentUserProfile={currentUserProfile}
              likes={likesData}
              comments={enrichedComments}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
