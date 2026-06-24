'use client'

import { errorState } from '@/lib/styles'

export default function ProfileError({ error, reset }: { error: Error; reset: () => void }): JSX.Element {
  return (
    <div className={errorState.wrapper}>
      <p className={errorState.message}>Failed to load profile: {error.message}</p>
      <button onClick={reset} className={errorState.button}>
        Try again
      </button>
    </div>
  )
}
