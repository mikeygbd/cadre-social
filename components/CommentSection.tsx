'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { CommentWithProfile } from '@/lib/types'

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
    <div className="mt-3 pt-3 border-t border-gray-100">
      {initialComments.length > 0 && (
        <ul className="space-y-2 mb-3">
          {initialComments.map((comment) => {
            const initial = (comment.display_name ?? 'U').charAt(0).toUpperCase()
            return (
              <li key={comment.id} className="flex items-start gap-2">
                {comment.avatar_url ? (
                  <img
                    src={comment.avatar_url}
                    alt={comment.display_name ?? 'User'}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5">
                    {initial}
                  </div>
                )}
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900 mr-1">
                    {comment.display_name ?? 'Anonymous'}
                  </span>
                  {comment.content}
                </p>
              </li>
            )
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="text-sm text-blue-600 font-medium hover:text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '…' : 'Post'}
        </button>
      </form>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
