'use client'

import { useRef } from 'react'
import Avatar from '@/components/Avatar'
import { ACCEPTED_IMAGE_EXTENSIONS } from '@/lib/storage/constants'
import { button, form, profile as profileStyles } from '@/lib/styles'

type Props = {
  currentUrl: string | null
  previewUrl: string | null
  displayName: string
  disabled: boolean
  isProcessing: boolean
  onFileSelected: (file: File) => void
  onRemove: () => void
}

const ACCEPT = ACCEPTED_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(',')

export default function AvatarPicker({
  currentUrl,
  previewUrl,
  displayName,
  disabled,
  isProcessing,
  onFileSelected,
  onRemove,
}: Props): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)
  const displayUrl = previewUrl ?? currentUrl
  const hasPhoto = Boolean(displayUrl)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelected(file)
    }
    e.target.value = ''
  }

  return (
    <div>
      <span className={form.label}>Profile Photo</span>
      <div className={profileStyles.avatarPicker}>
        <Avatar src={displayUrl} name={displayName} size="lg" priority />
        <div className={profileStyles.avatarPickerActions}>
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
            className={button.secondarySm}
          >
            {isProcessing ? 'Processing…' : hasPhoto ? 'Change photo' : 'Upload photo'}
          </button>
          {hasPhoto && (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled || isProcessing}
              className={button.ghost}
            >
              Remove
            </button>
          )}
          {isProcessing && (
            <span className={profileStyles.avatarPickerStatus}>Optimizing image…</span>
          )}
        </div>
      </div>
    </div>
  )
}
