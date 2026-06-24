'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { notifications as notifStyles } from '@/lib/styles'

function scrollToPostHash(): void {
  const hash = window.location.hash
  if (!hash.startsWith('#post-')) return

  const element = document.querySelector(hash)
  if (!element) return

  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  element.classList.add(notifStyles.postHighlight)

  window.setTimeout(() => {
    element.classList.remove(notifStyles.postHighlight)
  }, 2000)
}

export default function PostHashScroller(): null {
  const pathname = usePathname()

  useEffect(() => {
    scrollToPostHash()

    window.addEventListener('hashchange', scrollToPostHash)
    return () => {
      window.removeEventListener('hashchange', scrollToPostHash)
    }
  }, [pathname])

  return null
}
