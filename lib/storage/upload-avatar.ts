import type { SupabaseClient } from '@supabase/supabase-js'
import type { CompressedImage } from '@/lib/storage/compress-image'
import { AVATARS_BUCKET } from '@/lib/storage/constants'
import { getAvatarPublicUrl } from '@/lib/storage/get-public-url'

function extractAvatarStoragePath(avatarUrl: string): string | null {
  const marker = `/storage/v1/object/public/${AVATARS_BUCKET}/`
  const index = avatarUrl.indexOf(marker)
  if (index === -1) {
    return null
  }
  const pathWithQuery = avatarUrl.slice(index + marker.length)
  return pathWithQuery.split('?')[0] ?? null
}

export async function deleteAvatarFromStorage(
  supabase: SupabaseClient,
  userId: string,
  avatarUrl: string | null
): Promise<void> {
  if (!avatarUrl) {
    return
  }

  const path = extractAvatarStoragePath(avatarUrl)
  if (!path || !path.startsWith(`${userId}/`)) {
    return
  }

  const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([path])
  if (error) {
    throw new Error(error.message)
  }
}

export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  image: CompressedImage,
  currentAvatarUrl?: string | null
): Promise<string> {
  await deleteAvatarFromStorage(supabase, userId, currentAvatarUrl ?? null)

  const path = `${userId}/${crypto.randomUUID()}.${image.extension}`

  const { error } = await supabase.storage.from(AVATARS_BUCKET).upload(path, image.blob, {
    contentType: image.contentType,
    cacheControl: '31536000',
    upsert: false,
  })

  if (error) {
    throw new Error(error.message)
  }

  return getAvatarPublicUrl(path)
}
