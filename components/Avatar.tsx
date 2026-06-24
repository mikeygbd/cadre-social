'use client'

import { useState } from 'react'
import { avatar, cn } from '@/lib/styles'

type AvatarSize = 'sm' | 'md' | 'lg'

const sizeStyles: Record<
  AvatarSize,
  { wrapper: string; img: string; initials: string }
> = {
  sm: {
    wrapper: 'w-6 h-6',
    img: avatar.sm,
    initials: avatar.initialsSm,
  },
  md: {
    wrapper: 'w-10 h-10',
    img: avatar.md,
    initials: avatar.initialsMd,
  },
  lg: {
    wrapper: 'w-16 h-16',
    img: avatar.lg,
    initials: avatar.initialsLg,
  },
}

type Props = {
  src: string | null
  name: string | null
  size?: AvatarSize
  priority?: boolean
  className?: string
}

export default function Avatar({
  src,
  name,
  size = 'md',
  priority = false,
  className,
}: Props): JSX.Element {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const initial = (name ?? 'U').charAt(0).toUpperCase()
  const styles = sizeStyles[size]
  const showImage = Boolean(src) && !failed

  return (
    <div className={cn('relative flex-shrink-0', styles.wrapper, className)}>
      {showImage ? (
        <>
          {!loaded && (
            <div
              className={cn(styles.initials, 'absolute inset-0 animate-pulse')}
              aria-hidden
            >
              {initial}
            </div>
          )}
          <img
            src={src ?? undefined}
            alt={name ?? 'User'}
            className={cn(styles.img, 'transition-opacity duration-200', !loaded && 'opacity-0')}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </>
      ) : (
        <div className={styles.initials}>{initial}</div>
      )}
    </div>
  )
}
