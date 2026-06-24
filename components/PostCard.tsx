import Link from 'next/link'
import type { Post, Profile, PostLike, CommentWithProfile } from '@/lib/types'
import Avatar from '@/components/Avatar'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'
import PostMediaHero from '@/components/posts/PostMediaHero'
import { card, post as postStyles, typography } from '@/lib/styles'

type Props = {
  post: Post
  profile: Profile
  likes: PostLike[]
  comments: CommentWithProfile[]
  currentUserId: string
  isPending?: boolean
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function PostCard({
  post,
  profile,
  likes,
  comments,
  currentUserId,
  isPending = false,
}: Props): JSX.Element {
  const likeCount = likes.filter((l) => l.post_id === post.id).length
  const isLiked = likes.some((l) => l.post_id === post.id && l.user_id === currentUserId)
  const postComments = comments.filter((c) => c.post_id === post.id)
  const timeLabel = formatRelativeTime(post.created_at)
  const hasImage = Boolean(post.image_url)

  if (hasImage && post.image_url) {
    return (
      <article className={card.postMedia}>
        <PostMediaHero
          imageUrl={post.image_url}
          profile={profile}
          timeLabel={timeLabel}
          isPending={isPending}
        />
        <div className={postStyles.mediaBody}>
          {post.content && <p className={typography.postBody}>{post.content}</p>}
          <div className={postStyles.actions}>
            {!isPending && (
              <LikeButton postId={post.id} initialCount={likeCount} initialLiked={isLiked} />
            )}
          </div>
          {!isPending && (
            <CommentSection postId={post.id} initialComments={postComments} />
          )}
        </div>
      </article>
    )
  }

  return (
    <article className={card.post}>
      <div className={postStyles.header}>
        <Link href={`/profile/${profile.id}`}>
          <Avatar src={profile.avatar_url} name={profile.display_name} size="md" />
        </Link>
        <div>
          <Link href={`/profile/${profile.id}`} className={typography.link}>
            {profile.display_name ?? 'Anonymous'}
          </Link>
          <p className={typography.meta}>{timeLabel}</p>
        </div>
      </div>
      {post.content && <p className={typography.postBody}>{post.content}</p>}
      <div className={postStyles.actions}>
        {!isPending && (
          <LikeButton postId={post.id} initialCount={likeCount} initialLiked={isLiked} />
        )}
      </div>
      {!isPending && <CommentSection postId={post.id} initialComments={postComments} />}
    </article>
  )
}
