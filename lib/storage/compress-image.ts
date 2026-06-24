import {
  ACCEPTED_IMAGE_TYPES,
  AVATAR_MAX_DIMENSION,
  AVATAR_MIN_DIMENSION,
  AVATAR_STORAGE_MAX_BYTES,
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
  minDimension?: number
  targetOutputBytes?: number
  storageMaxBytes?: number
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

type OutputFormat = {
  type: 'image/jpeg' | 'image/webp'
  extension: string
}

let cachedOutputFormat: OutputFormat | null = null

function getOutputFormat(): OutputFormat {
  if (cachedOutputFormat) {
    return cachedOutputFormat
  }

  const useWebp =
    typeof document !== 'undefined' &&
    document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp')

  cachedOutputFormat = useWebp
    ? { type: 'image/webp', extension: 'webp' }
    : { type: 'image/jpeg', extension: 'jpg' }

  return cachedOutputFormat
}

async function readImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    const probe = await createImageBitmap(file)
    const dimensions = { width: probe.width, height: probe.height }
    probe.close()
    return dimensions
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = (): void => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = (): void => {
      URL.revokeObjectURL(url)
      reject(new ImageValidationError('Could not read this image file.'))
    }
    img.src = url
  })
}

async function decodeAtMaxDimension(
  file: File,
  maxDimension: number
): Promise<{ source: CanvasImageSource; width: number; height: number; cleanup: () => void }> {
  const natural = await readImageDimensions(file)
  const scaled = scaleDimensions(natural.width, natural.height, maxDimension)
  const needsResize = scaled.width !== natural.width || scaled.height !== natural.height

  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = needsResize
        ? await createImageBitmap(file, {
            resizeWidth: scaled.width,
            resizeHeight: scaled.height,
            resizeQuality: 'medium',
          })
        : await createImageBitmap(file)

      return {
        source: bitmap,
        width: scaled.width,
        height: scaled.height,
        cleanup: () => bitmap.close(),
      }
    } catch {
      // Fall back to full decode below.
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = (): void => {
      URL.revokeObjectURL(url)
      resolve({
        source: img,
        width: scaled.width,
        height: scaled.height,
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

async function encodeCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  outputType: 'image/jpeg' | 'image/webp',
  targetOutputBytes: number,
  storageMaxBytes: number
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new ImageValidationError('Could not process image in this browser.')
  }

  ctx.drawImage(source, 0, 0, width, height)

  let blob = await canvasToBlob(canvas, outputType, 0.82)

  if (blob.size > targetOutputBytes) {
    blob = await canvasToBlob(canvas, outputType, 0.65)
  }

  if (blob.size > storageMaxBytes) {
    blob = await canvasToBlob(canvas, outputType, 0.5)
  }

  return blob
}

/**
 * Fast client-side compression: decode scaled via createImageBitmap, then 1–3 encode passes.
 */
async function compressRasterImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressedImage> {
  const maxDimension = options.maxDimension ?? MAX_IMAGE_DIMENSION
  const minDimension = options.minDimension ?? MIN_IMAGE_DIMENSION
  const targetOutputBytes = options.targetOutputBytes ?? TARGET_OUTPUT_BYTES
  const storageMaxBytes = options.storageMaxBytes ?? STORAGE_MAX_BYTES
  const { type: outputType, extension } = getOutputFormat()

  const decoded = await decodeAtMaxDimension(file, maxDimension)

  try {
    let width = decoded.width
    let height = decoded.height
    let blob = await encodeCanvas(
      decoded.source,
      width,
      height,
      outputType,
      targetOutputBytes,
      storageMaxBytes
    )

    let dimension = maxDimension
    while (blob.size > storageMaxBytes && dimension >= minDimension) {
      dimension = Math.max(minDimension, Math.round(dimension * 0.75))
      const scaled = scaleDimensions(decoded.width, decoded.height, dimension)
      width = scaled.width
      height = scaled.height
      blob = await encodeCanvas(
        decoded.source,
        width,
        height,
        outputType,
        targetOutputBytes,
        storageMaxBytes
      )
    }

    if (blob.size > storageMaxBytes) {
      throw new ImageValidationError('Could not compress this image enough to upload.')
    }

    return {
      blob,
      width,
      height,
      contentType: outputType,
      extension,
    }
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
    minDimension: AVATAR_MIN_DIMENSION,
    targetOutputBytes: AVATAR_TARGET_OUTPUT_BYTES,
    storageMaxBytes: AVATAR_STORAGE_MAX_BYTES,
  })
}
