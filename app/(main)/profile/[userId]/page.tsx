import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Post } from '@/lib/types'
import FollowButton from '@/components/FollowButton'

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

  // Query 1: profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.userId)
    .single()

  if (profileError || !profileData) notFound()

  const profile: Profile = profileData

  // Query 2: posts for this user
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })

  if (postsError) throw new Error(postsError.message)

  const posts: Post[] = postsData ?? []
  const isOwnProfile = user.id === params.userId

  // Query 3: follower count
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', params.userId)

  // Query 4: following count
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', params.userId)

  // Query 5: does current user follow this profile?
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

  const initials = (profile.display_name ?? 'U').charAt(0).toUpperCase()

  return (
    <div>
      {/* Profile header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? 'User'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {profile.display_name ?? 'Anonymous'}
              </h1>
              {profile.bio && (
                <p className="text-gray-500 text-sm mt-1">{profile.bio}</p>
              )}
              <div className="flex gap-4 mt-1">
                <span className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-700">{posts.length}</span> posts
                </span>
                <span className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-700">{followerCount ?? 0}</span> followers
                </span>
                <span className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-700">{followingCount ?? 0}</span> following
                </span>
              </div>
            </div>
          </div>
          {isOwnProfile ? (
            <Link
              href="/profile/edit"
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              Edit profile
            </Link>
          ) : (
            <FollowButton targetUserId={params.userId} initialIsFollowing={isFollowing} />
          )}
        </div>
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-gray-800 whitespace-pre-wrap break-words">{post.content}</p>
              <p className="text-xs text-gray-400 mt-2">
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
