import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import { layout } from '@/lib/styles'

export const dynamic = 'force-dynamic'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className={layout.page}>
      <nav className={layout.nav}>
        <div className={layout.navInner}>
          <Link href="/feed" className={layout.navBrand}>
            Cadre Social
          </Link>
          <div className={layout.navLinks}>
            <Link href="/feed" className={layout.navLink}>
              Feed
            </Link>
            <Link href={`/profile/${user.id}`} className={layout.navLink}>
              Profile
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className={layout.main}>{children}</main>
    </div>
  )
}
