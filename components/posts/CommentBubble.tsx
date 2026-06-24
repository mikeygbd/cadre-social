'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { form, post } from '@/lib/styles'

type Props = {
  postId: string
  onClose: () => void
}

export default function CommentBubble({ postId, onClose }: Props): JSX.Element {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

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
    onClose()
    router.refresh()
  }

  return (
    <div className={post.commentBubble} role="dialog" aria-label="Write a comment">
      <form onSubmit={handleSubmit} className={post.commentBubbleInner}>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          className={post.commentBubbleInput}
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className={post.commentBubbleSubmit}
        >
          {submitting ? '…' : 'Post'}
        </button>
      </form>
      {error && <p className={`${form.errorInline} mt-1.5 px-1`}>{error}</p>}
    </div>
  )
}
