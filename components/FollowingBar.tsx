import Link from 'next/link'
import Avatar from '@/components/Avatar'
import type { Profile } from '@/lib/types'
import { following as followingStyles } from '@/lib/styles'

type Props = {
  profiles: Profile[]
}

export default function FollowingBar({ profiles }: Props): JSX.Element | null {
  if (profiles.length === 0) return null

  return (
    <section className={followingStyles.bar} aria-label="People you follow">
      <div className={followingStyles.inner}>
        <h2 className={followingStyles.title}>Following</h2>
        <ul className={followingStyles.list}>
          {profiles.map((profile) => (
            <li key={profile.id} className={followingStyles.listItem}>
              <Link href={`/profile/${profile.id}`} className={followingStyles.item}>
                <Avatar
                  src={profile.avatar_url}
                  name={profile.display_name}
                  size="lg"
                  className={followingStyles.avatar}
                />
                <span className={followingStyles.name}>
                  {profile.display_name ?? 'Anonymous'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
