'use client'

import LikeButton from '@/components/LikeButton'
import { post } from '@/lib/styles'

type Props = {
  postId: string
  likeCount: number
  initialLiked: boolean
  commentInputId: string
}

function CommentIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={post.actionIconSvg}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

export default function PostActionBar({
  postId,
  likeCount,
  initialLiked,
  commentInputId,
}: Props): JSX.Element {
  function focusCommentInput(): void {
    const input = document.getElementById(commentInputId)
    input?.focus()
  }

  return (
    <div className={post.actionBar}>
      <LikeButton
        postId={postId}
        initialCount={likeCount}
        initialLiked={initialLiked}
        showCount={false}
      />
      <button
        type="button"
        onClick={focusCommentInput}
        aria-label="Comment"
        className={post.actionIconBtn}
      >
        <CommentIcon />
      </button>
    </div>
  )
}
