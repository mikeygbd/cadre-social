'use client'

import { useEffect, useRef, useState } from 'react'
import { cn, post } from '@/lib/styles'

type Props = {
  src: string
  alt: string
  className?: string
  priority?: boolean
  onLoad?: () => void
  /** Low-res or blob URL shown instantly while the primary src loads. */
  placeholderSrc?: string
  hideFromScreenReaders?: boolean
}

export default function LoadingPhoto({
  src,
  alt,
  className,
  priority = false,
  onLoad,
  placeholderSrc,
  hideFromScreenReaders = false,
}: Props): JSX.Element {
  const [loaded, setLoaded] = useState(false)
  const [placeholderReady, setPlaceholderReady] = useState(!placeholderSrc)
  const imgRef = useRef<HTMLImageElement>(null)
  const onLoadRef = useRef(onLoad)

  onLoadRef.current = onLoad

  useEffect(() => {
    setLoaded(false)

    const el = imgRef.current
    if (el?.complete && el.naturalHeight > 0) {
      setLoaded(true)
      onLoadRef.current?.()
    }
  }, [src])

  useEffect(() => {
    setPlaceholderReady(!placeholderSrc)
  }, [placeholderSrc])

  const hasVisiblePlaceholder = Boolean(placeholderSrc && placeholderReady)
  const showLoader = !loaded && !hasVisiblePlaceholder

  function handlePrimaryLoad(): void {
    setLoaded(true)
    onLoadRef.current?.()
  }

  return (
    <>
      {showLoader && (
        <div className={post.photoLoader} aria-label="Loading photo" role="status">
          <div className={post.photoSpinner} />
        </div>
      )}
      {placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden
          className={cn(
            className,
            'transition-opacity duration-150',
            loaded ? 'opacity-0' : 'opacity-100'
          )}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setPlaceholderReady(true)}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={hideFromScreenReaders ? '' : alt}
        aria-hidden={hideFromScreenReaders}
        className={cn(
          className,
          Boolean(placeholderSrc) && 'absolute inset-0',
          'transition-opacity duration-150',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handlePrimaryLoad}
      />
    </>
  )
}
