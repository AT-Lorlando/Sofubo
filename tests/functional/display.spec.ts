import { test } from '@japa/runner'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import sharp from 'sharp'
import { photoStore } from '#services/photo_store'
import env from '#start/env'

async function addPhoto(at: string) {
  const jpeg = await sharp({ create: { width: 40, height: 30, channels: 3, background: '#000' } })
    .jpeg()
    .toBuffer()
  return photoStore.save(jpeg, new Date(at))
}

test.group('Display page', (group) => {
  group.each.setup(() => rm(env.get('PHOTOS_DIR')!, { recursive: true, force: true }))

  test('refuses a visit without token', async ({ client }) => {
    const response = await client.get('/')
    response.assertStatus(401)
    response.assertTextIncludes('Unauthorized')
  })

  test('asks the tablet to retry after a refusal', async ({ client }) => {
    const response = await client.get('/?token=wrong')
    response.assertStatus(401)
    response.assertHeader('refresh', '60')
  })

  test('asks the tablet to retry after a server error', async ({ client }) => {
    const dir = env.get('PHOTOS_DIR')!
    await mkdir(dirname(dir), { recursive: true })
    await writeFile(dir, 'not a folder') // readdir → ENOTDIR → 500
    const response = await client.get('/?token=test-token')
    response.assertStatus(500)
    response.assertHeader('refresh', '60')
  })

  test('refuses a wrong token', async ({ client }) => {
    const response = await client.get('/?token=wrong')
    response.assertStatus(401)
  })

  test('shows the empty state, refreshes, has no script and sets the cookie', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/?token=test-token')
    response.assertStatus(200)
    response.assertTextIncludes('Pas encore de photo')
    response.assertTextIncludes('http-equiv="refresh" content="300"')
    assert.notInclude(response.text(), '<script')
    assert.exists(response.cookie('display'))
  })

  test('shows the latest photo with its date and time', async ({ client }) => {
    await addPhoto('2026-11-26T10:00:00Z')
    await addPhoto('2026-11-27T13:32:00Z')

    const response = await client.get('/?token=test-token')
    response.assertStatus(200)
    response.assertTextIncludes('vendredi 27 novembre · 14 h 32')
    response.assertTextIncludes('src="/photos/2026-11-27T13-32-00Z.jpg?token=test-token"')
  })

  test('links the photo without token when visited with the cookie', async ({ client }) => {
    await addPhoto('2026-11-27T13:32:00Z')
    const response = await client.get('/').encryptedCookie('display', 'test-token')
    response.assertTextIncludes('src="/photos/2026-11-27T13-32-00Z.jpg"')
  })

  test('accepts the cookie alone', async ({ client }) => {
    const response = await client.get('/').encryptedCookie('display', 'test-token')
    response.assertStatus(200)
  })

  test('refuses a cookie holding an old token', async ({ client }) => {
    const response = await client.get('/').encryptedCookie('display', 'old-token')
    response.assertStatus(401)
  })

  test('serves a photo with a long cache', async ({ client, assert }) => {
    const photo = await addPhoto('2026-11-27T13:32:00Z')
    const response = await client.get(`/photos/${photo.name}?token=test-token`)
    response.assertStatus(200)
    assert.include(response.header('content-type'), 'image/jpeg')
    assert.include(response.header('cache-control'), 'max-age=31536000')
  })

  test('answers 404 for unknown or malformed photo names', async ({ client }) => {
    await addPhoto('2026-11-27T13:32:00Z')
    const traversal = await client.get('/photos/..%2F.env?token=test-token')
    traversal.assertStatus(404)
    const missing = await client.get('/photos/2020-01-01T00-00-00Z.jpg?token=test-token')
    missing.assertStatus(404)
    const malformed = await client.get('/photos/inexistant.jpg?token=test-token')
    malformed.assertStatus(404)
  })

  test('refuses a photo without token', async ({ client }) => {
    const photo = await addPhoto('2026-11-27T13:32:00Z')
    const response = await client.get(`/photos/${photo.name}`)
    response.assertStatus(401)
  })
})
