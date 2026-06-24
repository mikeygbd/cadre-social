'use client'

import { useRef } from 'react'
import { ACCEPTED_IMAGE_EXTENSIONS } from '@/lib/storage/constants'
import { post } from '@/lib/styles'

type Props = {
  previewUrl: string | null
  disabled: boolean
  isProcessing: boolean
  onFileSelected: (file: File) => void
  onRemove: () => void
}

const ACCEPT = ACCEPTED_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(',')

export default function PostImagePicker({
  previewUrl,
  disabled,
  isProcessing,
  onFileSelected,
  onRemove,
}: Props): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelected(file)
    }
    e.target.value = ''
  }

  return (
    <div className={post.imagePicker}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isProcessing}
        className={post.imagePickerButton}
      >
        {isProcessing ? 'Processing…' : 'Add photo'}
      </button>
      {previewUrl && (
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
      )}
    </div>
  )
}
