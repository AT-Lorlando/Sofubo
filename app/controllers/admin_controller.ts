import type { HttpContext } from '@adonisjs/core/http'
import { readFile, rm } from 'node:fs/promises'
import env from '#start/env'
import { safeEqual } from '#services/secrets'
import { processImage } from '#services/image_processor'
import { photoStore } from '#services/photo_store'
import { formatPhotoDate } from '#services/photo_date'
import { sendPhoto } from '#controllers/display_controller'

export default class AdminController {
  async showLogin({ view }: HttpContext) {
    return view.render('admin/login')
  }

  async login({ request, session, response, logger }: HttpContext) {
    if (!safeEqual(request.input('password'), env.get('ADMIN_PASSWORD'))) {
      logger.warn({ event: 'admin.login_failed' }, 'admin login failed')
      session.flash('error', 'Mot de passe incorrect')
      return response.redirect('/admin/login')
    }
    session.regenerate()
    session.put('admin', true)
    return response.redirect('/admin')
  }

  async index({ view }: HttpContext) {
    const photo = await photoStore.latest()
    return view.render('admin/index', {
      photo: photo && { url: `/admin/photos/${photo.name}`, date: formatPhotoDate(photo.takenAt) },
    })
  }

  async photo({ params, response }: HttpContext) {
    return sendPhoto(params.name, response)
  }

  async upload({ request, session, response, logger }: HttpContext) {
    const file = request.file('photo', { size: '20mb' })
    try {
      if (!file || !file.tmpPath || file.hasErrors) {
        session.flash(
          'error',
          file?.hasErrors ? 'Photo trop lourde (20 Mo maximum)' : 'Aucune photo reçue'
        )
        return response.redirect('/admin')
      }

      let jpeg: Buffer
      try {
        jpeg = await processImage(await readFile(file.tmpPath))
      } catch (err) {
        logger.warn({ event: 'photo.rejected', err, extname: file.extname }, 'photo rejected')
        session.flash('error', 'Image illisible')
        return response.redirect('/admin')
      }

      const photo = await photoStore.save(jpeg)
      logger.info(
        { event: 'photo.uploaded', photo: photo.name, bytes: jpeg.length },
        'photo uploaded'
      )
      session.flash('success', 'Photo envoyée')
      return response.redirect('/admin')
    } finally {
      // The original keeps its EXIF (GPS included): never leave it in the temp folder
      if (file?.tmpPath) await rm(file.tmpPath, { force: true })
    }
  }

  async logout({ session, response }: HttpContext) {
    session.clear()
    return response.redirect('/admin/login')
  }
}
