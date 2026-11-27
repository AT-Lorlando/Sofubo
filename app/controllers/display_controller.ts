import type { HttpContext } from '@adonisjs/core/http'
import { access } from 'node:fs/promises'
import { photoStore } from '#services/photo_store'
import { formatPhotoDate } from '#services/photo_date'

export default class DisplayController {
  async index({ request, view }: HttpContext) {
    const photo = await photoStore.latest()
    // Repeat the start URL token on the image, so it loads even if the cookie is refused.
    const token = request.qs().token
    const query = typeof token === 'string' ? `?token=${encodeURIComponent(token)}` : ''
    return view.render('display', {
      photo: photo && {
        url: `/photos/${photo.name}${query}`,
        date: formatPhotoDate(photo.takenAt),
      },
    })
  }

  async photo({ params, response }: HttpContext) {
    return sendPhoto(params.name, response)
  }
}

/** Streams a stored photo; 404 for a name that is not a photo or does not exist. */
export async function sendPhoto(name: string, response: HttpContext['response']) {
  const path = photoStore.path(name)
  if (!path) return response.notFound('Not found')
  try {
    await access(path)
  } catch {
    return response.notFound('Not found')
  }
  response.header('Cache-Control', 'public, max-age=31536000, immutable')
  return response.download(path)
}
