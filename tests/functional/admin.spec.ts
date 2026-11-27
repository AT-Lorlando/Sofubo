import { test } from '@japa/runner'
import type { ApiResponse } from '@japa/api-client'
import { rm } from 'node:fs/promises'
import sharp from 'sharp'
import { photoStore } from '#services/photo_store'
import env from '#start/env'

function assertRedirect(response: ApiResponse, location: string) {
  response.assertStatus(302)
  response.assertHeader('location', location)
}

function jpeg(width: number, height: number) {
  return sharp({ create: { width, height, channels: 3, background: '#a73' } })
    .jpeg()
    .toBuffer()
}

test.group('Admin', (group) => {
  group.each.setup(() => rm(env.get('PHOTOS_DIR')!, { recursive: true, force: true }))

  test('redirects to the login page without session', async ({ client }) => {
    const response = await client.get('/admin').redirects(0)
    assertRedirect(response, '/admin/login')
  })

  test('shows the login page', async ({ client }) => {
    const response = await client.get('/admin/login')
    response.assertStatus(200)
    response.assertTextIncludes('type="password"')
  })

  test('refuses a wrong password', async ({ client }) => {
    const response = await client
      .post('/admin/login')
      .withCsrfToken()
      .form({ password: 'wrong' })
      .redirects(0)
    assertRedirect(response, '/admin/login')
    response.assertFlashMessage('error', 'Mot de passe incorrect')
    response.assertSessionMissing('admin')
  })

  test('logs in with the right password', async ({ client }) => {
    const response = await client
      .post('/admin/login')
      .withCsrfToken()
      .form({ password: 'test-password' })
      .redirects(0)
    assertRedirect(response, '/admin')
    response.assertSession('admin', true)
  })

  test('shows the upload form and the empty state', async ({ client }) => {
    const response = await client.get('/admin').withSession({ admin: true })
    response.assertStatus(200)
    response.assertTextIncludes('type="file"')
    response.assertTextIncludes('Pas encore de photo')
  })

  test('shows the current photo and its date', async ({ client }) => {
    await photoStore.save(await jpeg(40, 30), new Date('2026-11-27T13:32:00Z'))
    const response = await client.get('/admin').withSession({ admin: true })
    response.assertTextIncludes('vendredi 27 novembre · 14 h 32')
    response.assertTextIncludes('src="/admin/photos/2026-11-27T13-32-00Z.jpg"')
  })

  test('serves the preview photo to the admin only', async ({ client }) => {
    const photo = await photoStore.save(await jpeg(40, 30), new Date('2026-11-27T13:32:00Z'))
    const ok = await client.get(`/admin/photos/${photo.name}`).withSession({ admin: true })
    ok.assertStatus(200)
    const denied = await client.get(`/admin/photos/${photo.name}`).redirects(0)
    assertRedirect(denied, '/admin/login')
  })

  test('uploads a photo, resized for the tablet', async ({ client, assert }) => {
    const response = await client
      .post('/admin/photos')
      .withCsrfToken()
      .withSession({ admin: true })
      .file('photo', await jpeg(3000, 2000), { filename: 'IMG_0001.jpg' })
      .redirects(0)

    assertRedirect(response, '/admin')
    response.assertFlashMessage('success', 'Photo envoyée')
    const latest = await photoStore.latest()
    assert.exists(latest)
    const meta = await sharp(photoStore.path(latest!.name)!).metadata()
    assert.equal(meta.width, 1280)
  })

  test('rejects a file that is not an image', async ({ client, assert }) => {
    const response = await client
      .post('/admin/photos')
      .withCsrfToken()
      .withSession({ admin: true })
      .file('photo', Buffer.from('not an image'), { filename: 'x.jpg' })
      .redirects(0)

    assertRedirect(response, '/admin')
    response.assertFlashMessage('error', 'Image illisible')
    assert.isNull(await photoStore.latest())
  })

  test('asks for a file when none is sent', async ({ client }) => {
    const response = await client
      .post('/admin/photos')
      .withCsrfToken()
      .withSession({ admin: true })
      .field('nothing', '1')
      .redirects(0)
    assertRedirect(response, '/admin')
    response.assertFlashMessage('error', 'Aucune photo reçue')
  })

  test('refuses an upload without session', async ({ client, assert }) => {
    const response = await client
      .post('/admin/photos')
      .withCsrfToken()
      .file('photo', await jpeg(100, 100), { filename: 'a.jpg' })
      .redirects(0)
    assertRedirect(response, '/admin/login')
    assert.isNull(await photoStore.latest())
  })

  test('refuses a login form without CSRF token', async ({ client }) => {
    const response = await client
      .post('/admin/login')
      .form({ password: 'test-password' })
      .redirects(0)
    response.assertSessionMissing('admin')
  })

  test('logs out', async ({ client }) => {
    const response = await client
      .post('/admin/logout')
      .withCsrfToken()
      .withSession({ admin: true })
      .redirects(0)
    assertRedirect(response, '/admin/login')
    response.assertSessionMissing('admin')
  })
})
