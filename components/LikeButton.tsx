'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn, like } from '@/lib/styles'

type Props = {
  postId: string
  initialCount: number
  initialLiked: boolean
  showCount?: boolean
}

export default function LikeButton({
  postId,
  initialCount,
  initialLiked,
  showCount = true,
}: Props): JSX.Element {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialCount)
  const inFlight = useRef(false)

  useEffect(() => {
    setLiked(initialLiked)
    setLikeCount(initialCount)
  }, [initialLiked, initialCount])

  async function handleToggle(): Promise<void> {
    if (inFlight.current) return
    inFlight.current = true

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      inFlight.current = false
      return
    }

    const wasLiked = liked
    const nextLiked = !wasLiked

    setLiked(nextLiked)
    setLikeCount((c) => (nextLiked ? c + 1 : c - 1))

    if (nextLiked) {
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id })
      if (error) {
        setLiked(wasLiked)
        setLikeCount((c) => (wasLiked ? c + 1 : c - 1))
      }
    } else {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      if (error) {
        setLiked(wasLiked)
        setLikeCount((c) => (wasLiked ? c + 1 : c - 1))
      }
    }

    inFlight.current = false
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={liked ? 'Unlike' : 'Like'}
      className={cn(like.iconBtn, liked ? like.active : like.inactive)}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={like.icon}
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={liked ? 0 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      {showCount && <span className="text-sm tabular-nums">{likeCount}</span>}
    </button>
  )
}
