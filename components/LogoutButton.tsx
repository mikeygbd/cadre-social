'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { button } from '@/lib/styles'

export default function LogoutButton(): JSX.Element {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout(): Promise<void> {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    if (error) {
      setLoading(false)
      return
    }
    router.refresh()
    window.location.assign('/login')
  }

  return (
    <button onClick={handleLogout} disabled={loading} className={button.ghost}>
      {loading ? 'Logging out…' : 'Log out'}
    </button>
  )
}
