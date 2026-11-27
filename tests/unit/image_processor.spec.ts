import { test } from '@japa/runner'
import sharp from 'sharp'
import { processImage } from '#services/image_processor'

function jpeg(width: number, height: number) {
  return sharp({ create: { width, height, channels: 3, background: '#3a7' } })
    .jpeg()
    .toBuffer()
}

test.group('processImage', () => {
  test('shrinks a large photo to 1280 px and strips metadata', async ({ assert }) => {
    const input = await sharp(await jpeg(4000, 3000))
      .withMetadata({ exif: { IFD0: { Copyright: 'someone' } } })
      .toBuffer()

    const output = await processImage(input)
    const meta = await sharp(output).metadata()

    assert.equal(meta.format, 'jpeg')
    assert.equal(meta.width, 1280)
    assert.equal(meta.height, 960)
    assert.isUndefined(meta.exif)
  })

  test('never enlarges a small photo', async ({ assert }) => {
    const meta = await sharp(await processImage(await jpeg(600, 400))).metadata()
    assert.equal(meta.width, 600)
    assert.equal(meta.height, 400)
  })

  test('applies the EXIF orientation', async ({ assert }) => {
    const rotated = await sharp(await jpeg(400, 300))
      .withMetadata({ orientation: 6 })
      .toBuffer()
    const meta = await sharp(await processImage(rotated)).metadata()
    assert.equal(meta.width, 300)
    assert.equal(meta.height, 400)
  })

  test('accepts a JPEG with a harmless decoder warning (extraneous bytes)', async ({ assert }) => {
    const full = await jpeg(400, 300)
    // Garbage between SOI and the next marker: "N extraneous bytes before marker"
    const noisy = Buffer.concat([full.subarray(0, 2), Buffer.alloc(4), full.subarray(2)])
    const meta = await sharp(await processImage(noisy)).metadata()
    assert.equal(meta.width, 400)
  })

  test('rejects data that is not an image', async ({ assert }) => {
    await assert.rejects(() => processImage(Buffer.from('not an image')))
  })
})
