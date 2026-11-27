import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const DisplayController = () => import('#controllers/display_controller')

router
  .group(() => {
    router.get('/', [DisplayController, 'index'])
    router.get('/photos/:name', [DisplayController, 'photo'])
  })
  .use(middleware.displayToken())
