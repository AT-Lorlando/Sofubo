import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'
import { safeEqual } from '#services/secrets'

const COOKIE = 'display'

/**
 * Tablet access: the start URL carries `?token=<DISPLAY_TOKEN>`; a valid token
 * is also kept in an encrypted cookie, so later requests work without it.
 * Rotating DISPLAY_TOKEN invalidates the cookie.
 */
export default class DisplayTokenMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const expected = env.get('DISPLAY_TOKEN')
    const fromQuery = request.qs().token

    if (safeEqual(fromQuery, expected)) {
      response.encryptedCookie(COOKIE, expected, {
        maxAge: '365d',
        httpOnly: true,
        sameSite: 'lax',
      })
      return next()
    }

    if (safeEqual(request.encryptedCookie(COOKIE), expected)) {
      return next()
    }

    response.status(401).header('Content-Type', 'text/plain; charset=utf-8').send('Unauthorized')
  }
}
