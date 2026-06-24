import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_DIMENSION,
  MAX_INPUT_BYTES,
  TARGET_OUTPUT_BYTES,
  type AcceptedImageType,
} from '@/lib/storage/constants'

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

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = (): void => {
      URL.revokeObjectURL(url)
      resolve(img)
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

async function compressWithCanvas(
  img: HTMLImageElement,
  outputType: 'image/jpeg' | 'image/webp' | 'image/png',
  extension: string
): Promise<CompressedImage> {
  const scaled = scaleDimensions(img.naturalWidth, img.naturalHeight, MAX_IMAGE_DIMENSION)
  const canvas = document.createElement('canvas')
  canvas.width = scaled.width
  canvas.height = scaled.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new ImageValidationError('Could not process image in this browser.')
  }

  ctx.drawImage(img, 0, 0, scaled.width, scaled.height)

  let quality = 0.92
  let blob = await canvasToBlob(canvas, outputType, quality)

  while (blob.size > TARGET_OUTPUT_BYTES && quality > 0.5) {
    quality -= 0.08
    blob = await canvasToBlob(canvas, outputType, quality)
  }

  return {
    blob,
    width: scaled.width,
    height: scaled.height,
    contentType: outputType,
    extension,
  }
}

/**
 * Compresses and normalizes photos of any common size for fast upload.
 * GIFs are passed through unchanged when under the size limit.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  if (!isAcceptedType(file.type)) {
    throw new ImageValidationError('Please choose a JPEG, PNG, WebP, or GIF image.')
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new ImageValidationError('Image must be 5 MB or smaller.')
  }

  if (file.type === 'image/gif') {
    return {
      blob: file,
      width: 0,
      height: 0,
      contentType: 'image/gif',
      extension: 'gif',
    }
  }

  const img = await loadImageFromFile(file)

  if (file.type === 'image/png') {
    return compressWithCanvas(img, 'image/png', 'png')
  }

  const prefersWebp =
    typeof document !== 'undefined' &&
    document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp')

  if (prefersWebp) {
    return compressWithCanvas(img, 'image/webp', 'webp')
  }

  return compressWithCanvas(img, 'image/jpeg', 'jpg')
}
