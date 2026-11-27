import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const DisplayController = () => import('#controllers/display_controller')

router
  .group(() => {
    router.get('/', [DisplayController, 'index'])
    router.get('/photos/:name', [DisplayController, 'photo'])
  })
  .use(middleware.displayToken())

const AdminController = () => import('#controllers/admin_controller')

router.get('/admin/login', [AdminController, 'showLogin'])
router.post('/admin/login', [AdminController, 'login'])

router
  .group(() => {
    router.get('/', [AdminController, 'index'])
    router.get('/photos/:name', [AdminController, 'photo'])
    router.post('/photos', [AdminController, 'upload'])
    router.post('/logout', [AdminController, 'logout'])
  })
  .prefix('/admin')
  .use(middleware.adminAuth())
