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
}

function revokeBlobUrl(url: string | undefined): void {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export default function FeedPosts({
  initialPosts,
  profiles,
  likes,
  comments,
  currentUserId,
}: Props): JSX.Element {
  const router = useRouter()
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([])
  const [postError, setPostError] = useState<string | null>(null)
  const [imageHandoffs, setImageHandoffs] = useState<Record<string, string>>({})

  const profileMap = new Map<string, Profile>(profiles.map((p) => [p.id, p]))

  const handleOptimisticPost = useCallback((post: PendingPost): void => {
    setPostError(null)
    setPendingPosts((prev) => [post, ...prev])
  }, [])

  const releaseImageHandoff = useCallback((postId: string): void => {
    setImageHandoffs((prev) => {
      const url = prev[postId]
      if (url) {
        revokeBlobUrl(url)
      }
      const next = { ...prev }
      delete next[postId]
      return next
    })
  }, [])

  const handlePostSuccess = useCallback(
    (tempId: string, newPost: Post, previewImageUrl?: string): void => {
      if (previewImageUrl && newPost.image_url) {
        setImageHandoffs((prev) => ({ ...prev, [newPost.id]: previewImageUrl }))
      }

      setPendingPosts((prev) =>
        prev.map((p) =>
          p.tempId === tempId
            ? { ...newPost, tempId, isPending: false, previewImageUrl }
            : p
        )
      )
      router.refresh()
    },
    [router]
  )

  const handlePostFailed = useCallback((tempId: string, error: string): void => {
    setPendingPosts((prev) => {
      const match = prev.find((p) => p.tempId === tempId)
      revokeBlobUrl(match?.previewImageUrl)
      return prev.filter((p) => p.tempId !== tempId)
    })
    setPostError(error)
  }, [])

  const visiblePending = pendingPosts.filter(
    (p) => !initialPosts.some((serverPost) => serverPost.id === p.id)
  )

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
            const currentUserProfile = profileMap.get(currentUserId)
            if (!profile || !currentUserProfile) return null

            const isPending = 'isPending' in post && post.isPending
            const previewImageUrl =
              imageHandoffs[post.id] ??
              ('previewImageUrl' in post ? post.previewImageUrl : undefined)
            const remoteImageUrl = post.image_url

            return (
              <PostCard
                key={'tempId' in post ? post.tempId : post.id}
                post={post}
                profile={profile}
                currentUserProfile={currentUserProfile}
                likes={likes}
                comments={comments}
                currentUserId={currentUserId}
                isPending={isPending}
                imageFallbackUrl={previewImageUrl}
                remoteImageUrl={remoteImageUrl}
                onImageHandoffComplete={() => releaseImageHandoff(post.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
