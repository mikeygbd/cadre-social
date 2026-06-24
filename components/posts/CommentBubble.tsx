'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import { form, post } from '@/lib/styles'

type Props = {
  postId: string
  avatarUrl: string | null
  displayName: string | null
  inputRef: React.RefObject<HTMLInputElement>
  onFocusChange: (focused: boolean) => void
}

export default function CommentBubble({
  postId,
  avatarUrl,
  displayName,
  inputRef,
  onFocusChange,
}: Props): JSX.Element {
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
    const {
      data: { user },
    } = await supabase.auth.getUser()
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

  const hasText = text.trim().length > 0

  return (
    <div className={post.commentBar}>
      <form onSubmit={handleSubmit} className={post.commentBarInner}>
        <Avatar src={avatarUrl} name={displayName} size="sm" className="shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          placeholder="Add a comment…"
          className={post.commentBarInput}
          aria-label="Add a comment"
        />
        {hasText && (
          <button
            type="submit"
            disabled={submitting}
            className={post.commentBarSubmit}
          >
            {submitting ? '…' : 'Post'}
          </button>
        )}
      </form>
      {error && <p className={`${form.errorInline} mt-1.5`}>{error}</p>}
    </div>
  )
}
