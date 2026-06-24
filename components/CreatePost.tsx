'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressImage, ImageValidationError, type CompressedImage } from '@/lib/storage/compress-image'
import { uploadPostImage } from '@/lib/storage/upload-post-image'
import type { PendingPost } from '@/lib/types'
import PostImagePicker from '@/components/posts/PostImagePicker'
import { button, card, form, post as postStyles } from '@/lib/styles'

const MAX_CHARS = 280

type Props = {
  onOptimisticPost: (post: PendingPost) => void
  onPostSuccess: (tempId: string) => void
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

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0
  const hasImage = compressedImage !== null
  const canSubmit = (content.trim().length > 0 || hasImage) && !isOverLimit && !isProcessingImage

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  function clearImage(): void {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreviewUrl(null)
    setCompressedImage(null)
  }

  async function handleFileSelected(file: File): Promise<void> {
    setError(null)
    setIsProcessingImage(true)

    try {
      const compressed = await compressImage(file)
      const localPreview = URL.createObjectURL(compressed.blob)

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
      previewUrlRef.current = localPreview
      setPreviewUrl(localPreview)
      setCompressedImage(compressed)
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
    const optimisticPreviewUrl = previewUrlRef.current ?? undefined
    const imageToUpload = compressedImage

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
    clearImage()
    setLoading(true)

    try {
      let imageUrl: string | null = null

      if (imageToUpload) {
        imageUrl = await uploadPostImage(supabase, user.id, imageToUpload)
      }

      const { error: insertError } = await supabase.from('posts').insert({
        user_id: user.id,
        content: trimmedContent,
        image_url: imageUrl,
      })

      if (insertError) {
        throw new Error(insertError.message)
      }

      onPostSuccess(tempId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post.'
      onPostFailed(tempId, message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${card.padded} mb-5`}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className={form.textareaSm}
      />
      <PostImagePicker
        previewUrl={previewUrl}
        disabled={loading}
        isProcessing={isProcessingImage}
        onFileSelected={handleFileSelected}
        onRemove={clearImage}
      />
      <div className="flex items-center justify-between mt-3">
        <span
          className={
            isOverLimit ? 'text-xs text-destructive font-semibold' : 'text-xs text-muted-foreground'
          }
        >
          {remaining}
        </span>
        <div className="flex items-center gap-3">
          {error && <p className={form.errorInline}>{error}</p>}
          {loading && hasImage && <span className={postStyles.pendingBadge}>Uploading…</span>}
          <button type="submit" disabled={loading || !canSubmit} className={button.primarySm}>
            {loading ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
