import { cn, post } from '@/lib/styles'

type Props = {
  src: string
  alt: string
  isPending?: boolean
}

export default function PostImage({ src, alt, isPending = false }: Props): JSX.Element {
  return (
    <div className={post.imageWrap}>
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
