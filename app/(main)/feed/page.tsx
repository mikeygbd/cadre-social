import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FeedPosts from '@/components/FeedPosts'
import type { Post, Profile, PostLike, PostComment, CommentWithProfile } from '@/lib/types'

export default async function FeedPage(): Promise<JSX.Element> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Query 1: posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (postsError) throw new Error(postsError.message)

  const typedPosts: Post[] = posts ?? []

  // Query 2: profiles for all post authors
  const userIds = [...new Set(typedPosts.map((p) => p.user_id))]
  const profilesData: Profile[] = []
  if (userIds.length > 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, bio, created_at')
      .in('id', userIds)
    if (error) throw new Error(error.message)
    profilesData.push(...(data ?? []))
  }

  // Query 3: likes for all posts
  const postIds = typedPosts.map((p) => p.id)
  const likesData: PostLike[] = []
  if (postIds.length > 0) {
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id, user_id, created_at')
      .in('post_id', postIds)
    if (error) throw new Error(error.message)
    likesData.push(...(data ?? []))
  }

  // Query 4: comments for all posts
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

  // Fetch profiles for comment authors not already in profilesData
  const commentAuthorIds = [...new Set(commentsData.map((c) => c.user_id))]
  const missingIds = commentAuthorIds.filter((id) => !profilesData.some((p) => p.id === id))
  if (missingIds.length > 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, bio, created_at')
      .in('id', missingIds)
    if (error) throw new Error(error.message)
    profilesData.push(...(data ?? []))
  }

  // Join in memory
  const profileMap = new Map<string, Profile>(profilesData.map((p) => [p.id, p]))

  const enrichedComments: CommentWithProfile[] = commentsData.map((c) => {
    const cp = profileMap.get(c.user_id)
    return { ...c, display_name: cp?.display_name ?? null, avatar_url: cp?.avatar_url ?? null }
  })

  const currentUserProfile = profileMap.get(user.id)
  if (!currentUserProfile) {
    const { data: selfProfile, error: selfProfileError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, bio, created_at')
      .eq('id', user.id)
      .single()
    if (selfProfileError || !selfProfile) throw new Error(selfProfileError?.message ?? 'Profile not found.')
    profileMap.set(user.id, selfProfile)
  }

  const allProfiles = [...profileMap.values()]

  return (
    <FeedPosts
      initialPosts={typedPosts}
      profiles={allProfiles}
      likes={likesData}
      comments={enrichedComments}
      currentUserId={user.id}
    />
  )
}
