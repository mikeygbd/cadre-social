'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn, like } from '@/lib/styles'

type Props = {
  postId: string
  initialCount: number
  initialLiked: boolean
}

export default function LikeButton({ postId, initialCount, initialLiked }: Props): JSX.Element {
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
    const { data: { user } } = await supabase.auth.getUser()
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
      onClick={handleToggle}
      className={cn(like.base, liked ? like.active : like.inactive)}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>{likeCount}</span>
    </button>
  )
}
