'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { button, card, form } from '@/lib/styles'

const MAX_CHARS = 280

export default function CreatePost(): JSX.Element {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!content.trim() || isOverLimit) return
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to post.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('posts')
      .insert({ user_id: user.id, content: content.trim() })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setContent('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className={`${card.padded} mb-5`}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className={form.textareaSm}
      />
      <div className="flex items-center justify-between mt-3">
        <span
          className={
            isOverLimit ? 'text-xs text-destructive font-semibold' : 'text-xs text-muted-foreground'
          }
        >
          {remaining}
        </span>
        {error && <p className={form.errorInline}>{error}</p>}
        <button
          type="submit"
          disabled={loading || !content.trim() || isOverLimit}
          className={button.primarySm}
        >
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  )
}
