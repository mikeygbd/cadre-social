import Link from 'next/link'
import type { Profile } from '@/lib/types'
import Avatar from '@/components/Avatar'
import { cn, post } from '@/lib/styles'

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
        className={cn(post.mediaImage, isPending && post.imagePending)}
        loading="lazy"
        decoding="async"
      />
      <div className={post.mediaGradient} aria-hidden="true" />
      <div className={post.mediaHeader}>
        <Link href={`/profile/${profile.id}`} className="flex-shrink-0">
          <Avatar
            src={profile.avatar_url}
            name={profile.display_name}
            size="md"
            className={post.mediaAvatar}
          />
        </Link>
        <div className="min-w-0">
          <Link href={`/profile/${profile.id}`} className={post.mediaAuthor}>
            {profile.display_name ?? 'Anonymous'}
          </Link>
          <p className={post.mediaTime}>{timeLabel}</p>
        </div>
      </div>
    </div>
  )
}
