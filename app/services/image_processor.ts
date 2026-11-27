import sharp from 'sharp'

/** Longest side of the stored photo, sized for the tablet screen. */
const MAX_SIDE = 1280

/**
 * Turns an uploaded photo into the light JPEG shown on the tablet:
 * upright (EXIF orientation applied), at most 1280 px, quality 80,
 * without any metadata (no GPS). Rejects when the input cannot be decoded.
 */
export async function processImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(MAX_SIDE, MAX_SIDE, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()
}
