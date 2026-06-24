import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Avatar from '@/components/Avatar'
import type { Profile, Post } from '@/lib/types'
import FollowButton from '@/components/FollowButton'
import PostImage from '@/components/posts/PostImage'
import {
  button,
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
  const isOwnProfile = user.id === params.userId

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
            <Link href="/profile/edit" className={button.secondarySm}>
              Edit profile
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
            <article key={post.id} className={card.post}>
              {post.image_url && (
                <PostImage
                  src={post.image_url}
                  alt={`Photo by ${profileRecord.display_name ?? 'user'}`}
                  bleedTop
                />
              )}
              {post.content && (
                <p className={post.image_url ? `${typography.postBody} mt-3` : typography.postBody}>
                  {post.content}
                </p>
              )}
              <p className={`${typography.meta} mt-3`}>
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
