'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { button, card, form, typography } from '@/lib/styles'

export default function LoginPage(): JSX.Element {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const displayName = data.user?.user_metadata?.display_name
    if (data.user && typeof displayName === 'string' && displayName.trim()) {
      await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', data.user.id)
        .is('display_name', null)
    }

    router.push('/feed')
  }

  return (
    <div className={card.auth}>
      <h1 className={typography.authTitle}>Cadre Social</h1>
      <p className={typography.authSubtitle}>Log in to your account</p>

      <form onSubmit={handleSubmit} className={form.fields}>
        <div>
          <label htmlFor="email" className={form.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={form.input}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className={form.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={form.input}
            placeholder="Your password"
          />
        </div>

        {error && <p className={form.error}>{error}</p>}

        <button type="submit" disabled={loading} className={button.primaryFull}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className={form.footer}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" className={form.footerLink}>
          Sign up
        </Link>
      </p>
    </div>
  )
}
