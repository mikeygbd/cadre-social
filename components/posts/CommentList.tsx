import Avatar from '@/components/Avatar'
import type { CommentWithProfile } from '@/lib/types'
import { post } from '@/lib/styles'

type Props = {
  comments: CommentWithProfile[]
}

export default function CommentList({ comments }: Props): JSX.Element {
  if (comments.length === 0) {
    return <></>
  }

  return (
    <ul className={post.commentList}>
      {comments.map((comment) => (
        <li key={comment.id} className={post.commentItem}>
          <Avatar
            src={comment.avatar_url}
            name={comment.display_name}
            size="sm"
            className="mt-0.5"
          />
          <p className={post.commentText}>
            <span className={post.commentAuthor}>
              {comment.display_name ?? 'Anonymous'}
            </span>
            <span className={post.commentBody}>{comment.content}</span>
          </p>
        </li>
      ))}
    </ul>
  )
}
