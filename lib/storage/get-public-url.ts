import { POST_IMAGES_BUCKET } from '@/lib/storage/constants'

export function getPostImagePublicUrl(storagePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.')
  }
  return `${baseUrl}/storage/v1/object/public/${POST_IMAGES_BUCKET}/${storagePath}`
}
