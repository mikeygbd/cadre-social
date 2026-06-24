import { AVATARS_BUCKET, POST_IMAGES_BUCKET } from '@/lib/storage/constants'

function getStoragePublicUrl(bucket: string, storagePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.')
  }
  return `${baseUrl}/storage/v1/object/public/${bucket}/${storagePath}`
}

export function getPostImagePublicUrl(storagePath: string): string {
  return getStoragePublicUrl(POST_IMAGES_BUCKET, storagePath)
}

export function getAvatarPublicUrl(storagePath: string): string {
  return getStoragePublicUrl(AVATARS_BUCKET, storagePath)
}
