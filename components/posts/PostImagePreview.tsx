import { post } from '@/lib/styles'

type Props = {
  previewUrl: string
  disabled: boolean
  onRemove: () => void
}

export default function PostImagePreview({ previewUrl, disabled, onRemove }: Props): JSX.Element {
  return (
    <div className={post.imagePreviewRow}>
      <div className={post.imagePreviewWrap}>
        <img src={previewUrl} alt="Selected photo preview" className={post.imagePreview} />
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className={post.imageRemove}
          aria-label="Remove photo"
        >
          ×
        </button>
      </div>
    </div>
  )
}
