import Link from 'next/link'
import type { Post, Profile, PostLike, CommentWithProfile } from '@/lib/types'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'

type Props = {
  post: Post
  profile: Profile
  likes: PostLike[]
  comments: CommentWithProfile[]
  currentUserId: string
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

export default function PostCard({ post, profile, likes, comments, currentUserId }: Props): JSX.Element {
  const likeCount = likes.filter((l) => l.post_id === post.id).length
  const isLiked = likes.some((l) => l.post_id === post.id && l.user_id === currentUserId)
  const postComments = comments.filter((c) => c.post_id === post.id)
  const initials = (profile.display_name ?? 'U').charAt(0).toUpperCase()

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${profile.id}`}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {initials}
            </div>
          )}
        </Link>
        <div>
          <Link
            href={`/profile/${profile.id}`}
            className="font-semibold text-gray-900 hover:text-blue-700 transition-colors"
          >
            {profile.display_name ?? 'Anonymous'}
          </Link>
          <p className="text-xs text-gray-400">{formatRelativeTime(post.created_at)}</p>
        </div>
      </div>
      <p className="text-gray-800 whitespace-pre-wrap break-words">{post.content}</p>
      <div className="mt-3 pt-3 border-t border-gray-50">
        <LikeButton
          postId={post.id}
          initialCount={likeCount}
          initialLiked={isLiked}
        />
      </div>
      <CommentSection postId={post.id} initialComments={postComments} />
    </article>
  )
}
