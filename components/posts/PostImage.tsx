import { cn, post } from '@/lib/styles'

type Props = {
  src: string
  alt: string
  bleedTop?: boolean
}

export default function PostImage({
  src,
  alt,
  bleedTop = false,
}: Props): JSX.Element {
  return (
    <div className={cn(post.imageWrap, bleedTop && '-mt-5')}>
      <img
        src={src}
        alt={alt}
        className={post.image}
        loading="eager"
        decoding="async"
      />
    </div>
  )
}
