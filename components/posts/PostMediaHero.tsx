'use client'

import Link from 'next/link'
import { useRef } from 'react'
import type { Profile } from '@/lib/types'
import Avatar from '@/components/Avatar'
import LoadingPhoto from '@/components/LoadingPhoto'
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
  const onHandoffCompleteRef = useRef(onHandoffComplete)

  onHandoffCompleteRef.current = onHandoffComplete

  function handleRemoteLoad(): void {
    if (useHandoff) {
      onHandoffCompleteRef.current?.()
    }
  }

  return (
    <div className={post.mediaHero}>
      <LoadingPhoto
        src={imageUrl}
        alt={`Photo by ${profile.display_name ?? 'user'}`}
        className={post.mediaImage}
        priority
        placeholderSrc={useHandoff ? fallbackUrl : undefined}
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
