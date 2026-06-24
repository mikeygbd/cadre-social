import {
  ACCEPTED_IMAGE_TYPES,
  AVATAR_MAX_DIMENSION,
  AVATAR_TARGET_OUTPUT_BYTES,
  GIF_PASSTHROUGH_MAX_BYTES,
  MAX_IMAGE_DIMENSION,
  MIN_IMAGE_DIMENSION,
  STORAGE_MAX_BYTES,
  TARGET_OUTPUT_BYTES,
  type AcceptedImageType,
} from '@/lib/storage/constants'

export type CompressOptions = {
  maxDimension?: number
  targetOutputBytes?: number
}

export type CompressedImage = {
  blob: Blob
  width: number
  height: number
  contentType: AcceptedImageType
  extension: string
}

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImageValidationError'
  }
}

type DecodedImage = {
  source: CanvasImageSource
  width: number
  height: number
  cleanup: () => void
}

function isAcceptedType(type: string): type is AcceptedImageType {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type)
}

function resolveMimeType(file: File): AcceptedImageType {
  if (isAcceptedType(file.type)) {
    return file.type
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  const byExtension: Record<string, AcceptedImageType> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  }

  if (ext && ext in byExtension) {
    return byExtension[ext]
  }

  throw new ImageValidationError('Please choose a JPEG, PNG, WebP, or GIF image.')
}

function scaleDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest <= maxDimension) {
    return { width, height }
  }
  const ratio = maxDimension / longest
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  }
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file)
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      }
    } catch {
      // Fall back to HTMLImageElement for formats createImageBitmap rejects.
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = (): void => {
      URL.revokeObjectURL(url)
      resolve({
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        cleanup: () => {},
      })
    }
    img.onerror = (): void => {
      URL.revokeObjectURL(url)
      reject(new ImageValidationError('Could not read this image file.'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }
        reject(new ImageValidationError('Failed to compress image.'))
      },
      type,
      quality
    )
  })
}

function prefersWebp(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp')
  )
}

async function renderToBlob(
  decoded: DecodedImage,
  maxDimension: number,
  outputType: 'image/jpeg' | 'image/webp',
  extension: string,
  targetOutputBytes: number,
  storageMaxBytes: number
): Promise<CompressedImage | null> {
  let dimension = maxDimension

  while (dimension >= MIN_IMAGE_DIMENSION) {
    const scaled = scaleDimensions(decoded.width, decoded.height, dimension)
    const canvas = document.createElement('canvas')
    canvas.width = scaled.width
    canvas.height = scaled.height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new ImageValidationError('Could not process image in this browser.')
    }

    ctx.drawImage(decoded.source, 0, 0, scaled.width, scaled.height)

    let quality = 0.9
    let blob = await canvasToBlob(canvas, outputType, quality)

    while (blob.size > targetOutputBytes && quality >= 0.35) {
      quality -= 0.07
      blob = await canvasToBlob(canvas, outputType, quality)
    }

    if (blob.size <= storageMaxBytes) {
      return {
        blob,
        width: scaled.width,
        height: scaled.height,
        contentType: outputType,
        extension,
      }
    }

    dimension = Math.round(dimension * 0.75)
  }

  return null
}

/**
 * Compresses any-size photos client-side for fast upload.
 * Large originals are scaled and re-encoded — no size limit on input.
 */
async function compressRasterImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressedImage> {
  const maxDimension = options.maxDimension ?? MAX_IMAGE_DIMENSION
  const targetOutputBytes = options.targetOutputBytes ?? TARGET_OUTPUT_BYTES
  const useWebp = prefersWebp()
  const outputType = useWebp ? 'image/webp' : 'image/jpeg'
  const extension = useWebp ? 'webp' : 'jpg'

  const decoded = await decodeImage(file)

  try {
    const result = await renderToBlob(
      decoded,
      maxDimension,
      outputType,
      extension,
      targetOutputBytes,
      STORAGE_MAX_BYTES
    )

    if (result) {
      return result
    }

    throw new ImageValidationError('Could not compress this image enough to upload.')
  } finally {
    decoded.cleanup()
  }
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressedImage> {
  const mimeType = resolveMimeType(file)

  if (mimeType === 'image/gif' && file.size <= GIF_PASSTHROUGH_MAX_BYTES) {
    return {
      blob: file,
      width: 0,
      height: 0,
      contentType: 'image/gif',
      extension: 'gif',
    }
  }

  return compressRasterImage(file, options)
}

/** Compresses an image for profile avatars — smaller dimensions and file size. */
export async function compressAvatar(file: File): Promise<CompressedImage> {
  return compressImage(file, {
    maxDimension: AVATAR_MAX_DIMENSION,
    targetOutputBytes: AVATAR_TARGET_OUTPUT_BYTES,
  })
}
