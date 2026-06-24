'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import CreatePost from '@/components/CreatePost'
import PostCard from '@/components/PostCard'
import type { CommentWithProfile, PendingPost, Post, PostLike, Profile } from '@/lib/types'
import { empty, layout } from '@/lib/styles'

type Props = {
  initialPosts: Post[]
  profiles: Profile[]
  likes: PostLike[]
  comments: CommentWithProfile[]
  currentUserId: string
  currentUserProfile: Profile
}

export default function FeedPosts({
  initialPosts,
  profiles,
  likes,
  comments,
  currentUserId,
  currentUserProfile,
}: Props): JSX.Element {
  const router = useRouter()
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([])
  const [postError, setPostError] = useState<string | null>(null)

  const profileMap = new Map<string, Profile>(profiles.map((p) => [p.id, p]))

  const handleOptimisticPost = useCallback((post: PendingPost): void => {
    setPostError(null)
    setPendingPosts((prev) => [post, ...prev])
  }, [])

  const handlePostSuccess = useCallback(
    (tempId: string): void => {
      setPendingPosts((prev) => prev.filter((p) => p.tempId !== tempId))
      router.refresh()
    },
    [router]
  )

  const handlePostFailed = useCallback((tempId: string, error: string): void => {
    setPendingPosts((prev) => prev.filter((p) => p.tempId !== tempId))
    setPostError(error)
  }, [])

  const serverPostIds = new Set(initialPosts.map((p) => p.id))
  const visiblePending = pendingPosts.filter((p) => !serverPostIds.has(p.id))

  const allPosts: Array<Post | PendingPost> = [...visiblePending, ...initialPosts]

  return (
    <div>
      <CreatePost
        onOptimisticPost={handleOptimisticPost}
        onPostSuccess={handlePostSuccess}
        onPostFailed={handlePostFailed}
      />
      {postError && (
        <p className="text-xs text-destructive mb-4 text-center">{postError}</p>
      )}
      {allPosts.length === 0 ? (
        <p className={empty.message}>No posts yet. Be the first!</p>
      ) : (
        <div className={layout.stack}>
          {allPosts.map((post) => {
            const profile = profileMap.get(post.user_id)
            if (!profile) return null

            const isPending = 'isPending' in post && post.isPending
            const displayPost: Post =
              isPending && post.previewImageUrl
                ? { ...post, image_url: post.previewImageUrl }
                : post

            return (
              <PostCard
                key={'tempId' in post ? post.tempId : post.id}
                post={displayPost}
                profile={profile}
                likes={likes}
                comments={comments}
                currentUserId={currentUserId}
                isPending={isPending}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
