'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { button, card, form, skeleton, typography } from '@/lib/styles'

export default function EditProfilePage(): JSX.Element {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('display_name, bio')
        .eq('id', user.id)
        .single()

      if (!fetchError && data) {
        const profile = data as Pick<Profile, 'display_name' | 'bio'>
        setDisplayName(profile.display_name ?? '')
        setBio(profile.bio ?? '')
      }

      setFetching(false)
    }

    void loadProfile()
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!userId) return
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: upsertError } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio })
      .eq('id', userId)

    if (upsertError) {
      setError(upsertError.message)
      setLoading(false)
      return
    }

    router.push(`/profile/${userId}`)
    router.refresh()
  }

  if (fetching) {
    return (
      <div className={`${skeleton.cardLg} ${skeleton.wrapper}`}>
        <div className="space-y-4">
          <div className={`h-4 ${skeleton.bar} w-1/3`} />
          <div className={`h-10 ${skeleton.barLight}`} />
          <div className={`h-4 ${skeleton.bar} w-1/3`} />
          <div className={`h-24 ${skeleton.barLight}`} />
        </div>
      </div>
    )
  }

  return (
    <div className={card.paddedLg}>
      <h1 className={`${typography.h2} mb-6`}>Edit Profile</h1>

      <form onSubmit={handleSubmit} className={form.fields}>
        <div>
          <label htmlFor="displayName" className={form.label}>
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={form.input}
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="bio" className={form.label}>
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className={form.textarea}
            placeholder="Tell people a bit about yourself"
          />
        </div>

        {error && <p className={form.error}>{error}</p>}

        <div className={form.actions}>
          <button type="submit" disabled={loading} className={button.primarySm}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={() => router.back()} className={button.secondary}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
