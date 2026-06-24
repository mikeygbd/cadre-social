import { cn, post } from '@/lib/styles'

type Props = {
  src: string
  alt: string
  isPending?: boolean
  bleedTop?: boolean
}

export default function PostImage({
  src,
  alt,
  isPending = false,
  bleedTop = false,
}: Props): JSX.Element {
  return (
    <div className={cn(post.imageWrap, bleedTop && '-mt-5')}>
      <img
        src={src}
        alt={alt}
        className={cn(post.image, isPending && post.imagePending)}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
