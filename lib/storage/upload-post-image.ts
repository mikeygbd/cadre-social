import type { SupabaseClient } from '@supabase/supabase-js'
import type { CompressedImage } from '@/lib/storage/compress-image'
import { POST_IMAGES_BUCKET } from '@/lib/storage/constants'
import { getPostImagePublicUrl } from '@/lib/storage/get-public-url'

export async function uploadPostImage(
  supabase: SupabaseClient,
  userId: string,
  image: CompressedImage
): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.${image.extension}`

  const { error } = await supabase.storage.from(POST_IMAGES_BUCKET).upload(path, image.blob, {
    contentType: image.contentType,
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw new Error(error.message)
  }

  return getPostImagePublicUrl(path)
}
