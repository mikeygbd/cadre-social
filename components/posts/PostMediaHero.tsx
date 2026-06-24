'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Profile } from '@/lib/types'
import Avatar from '@/components/Avatar'
import { post } from '@/lib/styles'

type Props = {
  imageUrl: string
  profile: Profile
  timeLabel: string
  fallbackUrl?: string
  onHandoffComplete?: () => void
}

export default function PostMediaHero({
  imageUrl,
  profile,
  timeLabel,
  fallbackUrl,
  onHandoffComplete,
}: Props): JSX.Element {
  const useHandoff = Boolean(fallbackUrl && fallbackUrl !== imageUrl)
  const [remoteReady, setRemoteReady] = useState(!useHandoff)
  const onHandoffCompleteRef = useRef(onHandoffComplete)

  const remoteRef = useRef<HTMLImageElement>(null)

  onHandoffCompleteRef.current = onHandoffComplete

  useEffect(() => {
    setRemoteReady(!useHandoff)

    const el = remoteRef.current
    if (useHandoff && el?.complete && el.naturalHeight > 0) {
      setRemoteReady(true)
      onHandoffCompleteRef.current?.()
    }
  }, [imageUrl, fallbackUrl, useHandoff])

  const handleRemoteLoad = (): void => {
    setRemoteReady(true)
    if (useHandoff) {
      onHandoffCompleteRef.current?.()
    }
  }

  return (
    <div className={post.mediaHero}>
      {useHandoff && fallbackUrl ? (
        <img
          src={fallbackUrl}
          alt=""
          aria-hidden
          className={`${post.mediaImage} transition-opacity duration-150 ${
            remoteReady ? 'opacity-0' : 'opacity-100'
          }`}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      ) : null}
      <img
        ref={remoteRef}
        src={imageUrl}
        alt={`Photo by ${profile.display_name ?? 'user'}`}
        className={`${post.mediaImage} ${useHandoff ? 'absolute inset-0' : ''} transition-opacity duration-150 ${
          remoteReady ? 'opacity-100' : 'opacity-0'
        }`}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onLoad={handleRemoteLoad}
      />
      <div className={post.mediaHeader}>
        <div className={post.mediaHeaderPill}>
          <Link href={`/profile/${profile.id}`} className="flex-shrink-0">
            <Avatar src={profile.avatar_url} name={profile.display_name} size="md" />
          </Link>
          <div className="min-w-0">
            <Link href={`/profile/${profile.id}`} className={post.mediaAuthor}>
              {profile.display_name ?? 'Anonymous'}
            </Link>
            <p className={post.mediaTime}>{timeLabel}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
