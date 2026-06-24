'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import type { CommentWithProfile } from '@/lib/types'
import { button, form, post } from '@/lib/styles'

type Props = {
  postId: string
  initialComments: CommentWithProfile[]
}

export default function CommentSection({ postId, initialComments }: Props): JSX.Element {
  const router = useRouter()
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || submitting) return
    setError(null)
    setSubmitting(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to comment.')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, content: trimmed })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setText('')
    setSubmitting(false)
    router.refresh()
  }

  return (
    <div className={post.comments}>
      {initialComments.length > 0 && (
        <ul className={post.commentList}>
          {initialComments.map((comment) => (
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
                  {comment.content}
                </p>
              </li>
            ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className={post.commentForm}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          className={form.commentInput}
        />
        <button type="submit" disabled={submitting || !text.trim()} className={button.text}>
          {submitting ? '…' : 'Post'}
        </button>
      </form>
      {error && <p className={`${form.errorInline} mt-1`}>{error}</p>}
    </div>
  )
}
