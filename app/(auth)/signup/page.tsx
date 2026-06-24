'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { button, card, form, typography } from '@/lib/styles'

export default function SignupPage(): JSX.Element {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const trimmedName = displayName.trim()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: trimmedName },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user && trimmedName) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: trimmedName })
        .eq('id', data.user.id)

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    router.push('/feed')
  }

  return (
    <div className={card.auth}>
      <h1 className={typography.authTitle}>Cadre Social</h1>
      <p className={typography.authSubtitle}>Create your account</p>

      <form onSubmit={handleSubmit} className={form.fields}>
        <div>
          <label htmlFor="displayName" className={form.label}>
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={form.input}
            placeholder="Your name"
          />
        </div>

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={form.input}
            placeholder="At least 6 characters"
          />
        </div>

        {error && <p className={form.error}>{error}</p>}

        <button type="submit" disabled={loading} className={button.primaryFull}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className={form.footer}>
        Already have an account?{' '}
        <Link href="/login" className={form.footerLink}>
          Log in
        </Link>
      </p>
    </div>
  )
}
