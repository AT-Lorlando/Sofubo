import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/** Admin pages need a session opened with ADMIN_PASSWORD. */
export default class AdminAuthMiddleware {
  async handle({ session, response }: HttpContext, next: NextFn) {
    if (session.get('admin') !== true) return response.redirect('/admin/login')
    return next()
  }
}
