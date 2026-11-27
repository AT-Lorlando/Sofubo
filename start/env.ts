import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum.optional([
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
  ] as const),

  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),
  /** Send cookies only over HTTPS (default: true in production). */
  COOKIE_SECURE: Env.schema.boolean.optional(),

  /** Secret put in the tablet start URL: /?token=<DISPLAY_TOKEN> */
  DISPLAY_TOKEN: Env.schema.string(),
  /** Password of the admin page */
  ADMIN_PASSWORD: Env.schema.string(),
  /** Where photos are stored (relative to the app root, or absolute) */
  PHOTOS_DIR: Env.schema.string.optional(),
})
