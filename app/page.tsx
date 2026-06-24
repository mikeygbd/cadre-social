import Link from 'next/link'
import { button, landing, layout, typography } from '@/lib/styles'

export default function HomePage(): JSX.Element {
  return (
    <main className={layout.pageHero}>
      <div className={layout.heroGlow} />
      <div className={landing.content}>
        <h1 className={typography.hero}>Cadre Social</h1>
        <p className={typography.subtitle}>A place to connect with friends.</p>
        <div className={landing.actions}>
          <Link href="/login" className={button.primaryMd}>
            Log in
          </Link>
          <Link href="/signup" className={button.outline}>
            Sign up
          </Link>
        </div>
      </div>
    </main>
  )
}
