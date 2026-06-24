'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AvatarPicker from '@/components/profile/AvatarPicker'
import {
  compressAvatar,
  ImageValidationError,
  type CompressedImage,
} from '@/lib/storage/compress-image'
import { deleteAvatarFromStorage, uploadAvatar } from '@/lib/storage/upload-avatar'
import { MAX_BIO_LENGTH } from '@/lib/storage/constants'
import type { Profile } from '@/lib/types'
import { button, card, form, profile as profileStyles, skeleton, typography } from '@/lib/styles'

export default function EditProfilePage(): JSX.Element {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [compressedAvatar, setCompressedAvatar] = useState<CompressedImage | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  const bioRemaining = MAX_BIO_LENGTH - bio.length
  const isBioOverLimit = bioRemaining < 0

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url')
        .eq('id', user.id)
        .single()

      if (!fetchError && data) {
        const profile = data as Pick<Profile, 'display_name' | 'bio' | 'avatar_url'>
        setDisplayName(profile.display_name ?? '')
        setBio(profile.bio ?? '')
        setCurrentAvatarUrl(profile.avatar_url)
      }

      setFetching(false)
    }

    void loadProfile()
  }, [router])

  function clearPendingAvatar(): void {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreviewUrl(null)
    setCompressedAvatar(null)
  }

  function handleRemoveAvatar(): void {
    clearPendingAvatar()
    setRemoveAvatar(true)
  }

  async function handleFileSelected(file: File): Promise<void> {
    setError(null)
    setIsProcessingImage(true)
    setRemoveAvatar(false)

    try {
      const compressed = await compressAvatar(file)
      const localPreview = URL.createObjectURL(compressed.blob)

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
      previewUrlRef.current = localPreview
      setPreviewUrl(localPreview)
      setCompressedAvatar(compressed)
    } catch (err) {
      const message =
        err instanceof ImageValidationError ? err.message : 'Could not process that image.'
      setError(message)
    } finally {
      setIsProcessingImage(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!userId || isBioOverLimit) return

    setError(null)
    setLoading(true)

    const supabase = createClient()
    let avatarUrl = currentAvatarUrl

    try {
      if (removeAvatar && currentAvatarUrl) {
        await deleteAvatarFromStorage(supabase, userId, currentAvatarUrl)
        avatarUrl = null
      } else if (compressedAvatar) {
        setIsUploadingImage(true)
        avatarUrl = await uploadAvatar(supabase, userId, compressedAvatar, currentAvatarUrl)
        setIsUploadingImage(false)
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq('id', userId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      router.push(`/profile/${userId}`)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile.'
      setError(message)
      setLoading(false)
      setIsUploadingImage(false)
    }
  }

  if (fetching) {
    return (
      <div className={`${skeleton.cardLg} ${skeleton.wrapper}`}>
        <div className="space-y-4">
          <div className={`h-4 ${skeleton.bar} w-1/3`} />
          <div className="flex items-center gap-4">
            <div className={skeleton.avatarLg} />
            <div className={`h-8 ${skeleton.barLight} w-28`} />
          </div>
          <div className={`h-4 ${skeleton.bar} w-1/3`} />
          <div className={`h-10 ${skeleton.barLight}`} />
          <div className={`h-4 ${skeleton.bar} w-1/3`} />
          <div className={`h-24 ${skeleton.barLight}`} />
        </div>
      </div>
    )
  }

  const isBusy = loading || isProcessingImage || isUploadingImage
  const statusMessage = isProcessingImage
    ? 'Processing photo…'
    : isUploadingImage
      ? 'Uploading photo…'
      : loading
        ? 'Saving…'
        : null

  return (
    <div className={card.paddedLg}>
      <h1 className={`${typography.h2} mb-6`}>Edit Profile</h1>

      <form onSubmit={handleSubmit} className={form.fields}>
        <AvatarPicker
          currentUrl={removeAvatar ? null : currentAvatarUrl}
          previewUrl={previewUrl}
          displayName={displayName}
          disabled={isBusy}
          isProcessing={isProcessingImage}
          onFileSelected={handleFileSelected}
          onRemove={handleRemoveAvatar}
        />

        <div>
          <label htmlFor="displayName" className={form.label}>
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={form.input}
            placeholder="Your name"
            disabled={isBusy}
          />
        </div>

        <div>
          <label htmlFor="bio" className={form.label}>
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={MAX_BIO_LENGTH + 20}
            className={form.textarea}
            placeholder="Tell people a bit about yourself"
            disabled={isBusy}
          />
          <p
            className={
              isBioOverLimit
                ? 'text-xs text-destructive font-semibold mt-1.5'
                : 'text-xs text-muted-foreground mt-1.5'
            }
          >
            {bioRemaining} characters remaining
          </p>
        </div>

        {error && <p className={form.error}>{error}</p>}

        <div className={form.actions}>
          <button
            type="submit"
            disabled={isBusy || isBioOverLimit}
            className={button.primarySm}
          >
            {statusMessage ?? 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isBusy}
            className={button.secondary}
          >
            Cancel
          </button>
          {statusMessage && (
            <span className={`${profileStyles.editStatus} self-center`}>{statusMessage}</span>
          )}
        </div>
      </form>
    </div>
  )
}
