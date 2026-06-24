export const POST_IMAGES_BUCKET = 'post-images'
export const AVATARS_BUCKET = 'avatars'

/** Supabase post-images bucket upload ceiling. */
export const STORAGE_MAX_BYTES = 5 * 1024 * 1024

/** Supabase avatars bucket upload ceiling (matches migration file_size_limit). */
export const AVATAR_STORAGE_MAX_BYTES = 2 * 1024 * 1024

/** Target max dimension — larger photos are scaled down proportionally. */
export const MAX_IMAGE_DIMENSION = 1920

/** Minimum dimension when aggressively re-scaling stubborn files. */
export const MIN_IMAGE_DIMENSION = 640

/** Target output size after compression (~600 KB). */
export const TARGET_OUTPUT_BYTES = 600 * 1024

/** Avatar max dimension (512px covers 2× retina at lg size). */
export const AVATAR_MAX_DIMENSION = 512

/** Floor when re-scaling stubborn avatar files (display size is 64px). */
export const AVATAR_MIN_DIMENSION = 64

/** Target avatar output size (~150 KB). */
export const AVATAR_TARGET_OUTPUT_BYTES = 150 * 1024

/** Max bio length in characters. */
export const MAX_BIO_LENGTH = 160

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number]

export const ACCEPTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const

/** Small animated GIFs may pass through without re-encoding. */
export const GIF_PASSTHROUGH_MAX_BYTES = 500 * 1024
