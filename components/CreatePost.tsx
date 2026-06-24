'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressImage, ImageValidationError, type CompressedImage } from '@/lib/storage/compress-image'
import { uploadPostImage } from '@/lib/storage/upload-post-image'
import type { PendingPost, Post } from '@/lib/types'
import PostImagePicker from '@/components/posts/PostImagePicker'
import PostImagePreview from '@/components/posts/PostImagePreview'
import { button, card, form, post as postStyles } from '@/lib/styles'

const MAX_CHARS = 280

type Props = {
  onOptimisticPost: (post: PendingPost) => void
  onPostSuccess: (tempId: string, newPost: Post) => void
  onPostFailed: (tempId: string, error: string) => void
}

export default function CreatePost({
  onOptimisticPost,
  onPostSuccess,
  onPostFailed,
}: Props): JSX.Element {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const previewUrlRef = useRef<string | null>(null)
  const selectedFileRef = useRef<File | null>(null)
  const compressGenerationRef = useRef(0)

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0
  const hasPreview = previewUrl !== null
  const canSubmit = (content.trim().length > 0 || hasPreview) && !isOverLimit && !loading

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  function detachPreviewForHandoff(): string | undefined {
    const url = previewUrlRef.current ?? undefined
    previewUrlRef.current = null
    setPreviewUrl(null)
    setCompressedImage(null)
    selectedFileRef.current = null
    setIsProcessingImage(false)
    return url
  }

  function clearImage(): void {
    compressGenerationRef.current += 1
    selectedFileRef.current = null
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreviewUrl(null)
    setCompressedImage(null)
    setIsProcessingImage(false)
  }

  async function handleFileSelected(file: File): Promise<void> {
    setError(null)
    compressGenerationRef.current += 1
    const generation = compressGenerationRef.current
    selectedFileRef.current = file

    const instantPreview = URL.createObjectURL(file)
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    previewUrlRef.current = instantPreview
    setPreviewUrl(instantPreview)
    setCompressedImage(null)
    setIsProcessingImage(true)

    try {
      const compressed = await compressImage(file)
      if (generation !== compressGenerationRef.current) {
        return
      }
      setCompressedImage(compressed)
    } catch (err) {
      if (generation !== compressGenerationRef.current) {
        return
      }
      const message =
        err instanceof ImageValidationError ? err.message : 'Could not process that image.'
      setError(message)
      clearImage()
    } finally {
      if (generation === compressGenerationRef.current) {
        setIsProcessingImage(false)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!canSubmit) return

    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to post.')
      return
    }

    const trimmedContent = content.trim()
    const tempId = crypto.randomUUID()
    let imageToUpload = compressedImage

    if (!imageToUpload && selectedFileRef.current) {
      setIsProcessingImage(true)
      try {
        imageToUpload = await compressImage(selectedFileRef.current)
        setCompressedImage(imageToUpload)
      } catch (err) {
        const message =
          err instanceof ImageValidationError ? err.message : 'Could not process that image.'
        setError(message)
        setIsProcessingImage(false)
        return
      }
      setIsProcessingImage(false)
    }

    const optimisticPreviewUrl = imageToUpload
      ? detachPreviewForHandoff()
      : previewUrlRef.current
        ? detachPreviewForHandoff()
        : undefined

    const optimisticPost: PendingPost = {
      id: tempId,
      tempId,
      user_id: user.id,
      content: trimmedContent,
      image_url: optimisticPreviewUrl ?? null,
      created_at: new Date().toISOString(),
      isPending: true,
      previewImageUrl: optimisticPreviewUrl,
    }

    onOptimisticPost(optimisticPost)
    setContent('')
    setLoading(true)

    try {
      let imageUrl: string | null = null

      if (imageToUpload) {
        imageUrl = await uploadPostImage(supabase, user.id, imageToUpload)
      }

      const { data: newPost, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: trimmedContent,
          image_url: imageUrl,
        })
        .select()
        .single()

      if (insertError || !newPost) {
        throw new Error(insertError?.message ?? 'Failed to create post.')
      }

      onPostSuccess(tempId, newPost as Post)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post.'
      onPostFailed(tempId, message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={previewUrl ? `${card.postMedia} mb-5` : `${card.padded} mb-5`}
    >
      {previewUrl ? (
        <PostImagePreview previewUrl={previewUrl} disabled={loading} onRemove={clearImage} />
      ) : (
        <div className={postStyles.imagePickerRow}>
          <PostImagePicker
            disabled={loading}
            isProcessing={isProcessingImage}
            onFileSelected={handleFileSelected}
          />
        </div>
      )}
      <div className={previewUrl ? postStyles.mediaBody : undefined}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className={form.textareaSm}
        />
        <div className="flex items-center justify-between mt-3">
          <span
            className={
              isOverLimit ? 'text-xs text-destructive font-semibold' : 'text-xs text-muted-foreground'
            }
          >
            {remaining}
          </span>
          <div className="flex items-center gap-1">
            {error && <p className={`${form.errorInline} mr-2`}>{error}</p>}
            {loading && hasPreview && (
              <span className={`${postStyles.pendingBadge} mr-1`}>Uploading…</span>
            )}
            {isProcessingImage && hasPreview && (
              <span className={`${postStyles.pendingBadge} mr-1`}>Preparing…</span>
            )}
            <button type="submit" disabled={loading || !canSubmit} className={button.primarySm}>
              {loading ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
