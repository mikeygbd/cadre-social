import { layout } from '@/lib/styles'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return <main className={layout.pageCentered}>{children}</main>
}
