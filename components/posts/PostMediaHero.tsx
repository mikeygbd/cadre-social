import Link from 'next/link'
import type { Profile } from '@/lib/types'
import Avatar from '@/components/Avatar'
import { post } from '@/lib/styles'

type Props = {
  imageUrl: string
  profile: Profile
  timeLabel: string
  isPending?: boolean
}

export default function PostMediaHero({
  imageUrl,
  profile,
  timeLabel,
  isPending = false,
}: Props): JSX.Element {
  return (
    <div className={post.mediaHero}>
      <img
        src={imageUrl}
        alt={`Photo by ${profile.display_name ?? 'user'}`}
        className={post.mediaImage}
        loading="eager"
        decoding="async"
        fetchPriority={isPending ? 'high' : 'auto'}
      />
      <div className={post.mediaHeader}>
        <div className={post.mediaHeaderPill}>
          <Link href={`/profile/${profile.id}`} className="flex-shrink-0">
            <Avatar src={profile.avatar_url} name={profile.display_name} size="md" />
          </Link>
          <div className="min-w-0">
            <Link href={`/profile/${profile.id}`} className={post.mediaAuthor}>
              {profile.display_name ?? 'Anonymous'}
            </Link>
            <p className={post.mediaTime}>{timeLabel}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
