export const POST_IMAGES_BUCKET = 'post-images'
export const AVATARS_BUCKET = 'avatars'

/** Max upload size before client-side compression (5 MB). */
export const MAX_INPUT_BYTES = 5 * 1024 * 1024

/** Target max dimension — larger photos are scaled down proportionally. */
export const MAX_IMAGE_DIMENSION = 1920

/** Target output size after compression (~800 KB). */
export const TARGET_OUTPUT_BYTES = 800 * 1024

/** Avatar max dimension (512px covers 2× retina at lg size). */
export const AVATAR_MAX_DIMENSION = 512

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
