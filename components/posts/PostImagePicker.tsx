'use client'

import { useRef } from 'react'
import { ACCEPTED_IMAGE_EXTENSIONS } from '@/lib/storage/constants'
import { post } from '@/lib/styles'

type Props = {
  disabled: boolean
  isProcessing: boolean
  onFileSelected: (file: File) => void
}

const ACCEPT = ACCEPTED_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(',')

function ImageIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

export default function PostImagePicker({
  disabled,
  isProcessing,
  onFileSelected,
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
    <>
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
        className={post.imagePickerIcon}
        aria-label={isProcessing ? 'Processing photo' : 'Add photo'}
        title={isProcessing ? 'Processing…' : 'Add photo'}
      >
        <ImageIcon />
      </button>
    </>
  )
}
