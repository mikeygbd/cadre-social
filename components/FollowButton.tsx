'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { button, cn } from '@/lib/styles'

type Props = {
  targetUserId: string
  initialIsFollowing: boolean
}

export default function FollowButton({ targetUserId, initialIsFollowing }: Props): JSX.Element {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const inFlight = useRef(false)

  useEffect(() => {
    setIsFollowing(initialIsFollowing)
  }, [initialIsFollowing])

  async function handleToggle(): Promise<void> {
    if (inFlight.current) return
    inFlight.current = true

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      inFlight.current = false
      return
    }

    const wasFollowing = isFollowing
    setIsFollowing(!wasFollowing)

    if (!wasFollowing) {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: targetUserId })
      if (error) setIsFollowing(wasFollowing)
    } else {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
      if (error) setIsFollowing(wasFollowing)
    }

    inFlight.current = false
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(isFollowing ? button.followActive : button.followInactive)}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
