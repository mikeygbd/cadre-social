'use client'

import LoadingPhoto from '@/components/LoadingPhoto'
import { cn, post } from '@/lib/styles'

type Props = {
  src: string
  alt: string
  bleedTop?: boolean
}

export default function PostImage({ src, alt, bleedTop = false }: Props): JSX.Element {
  return (
    <div className={cn(post.imageWrap, bleedTop && '-mt-5')}>
      <LoadingPhoto src={src} alt={alt} className={post.image} priority />
    </div>
  )
}
