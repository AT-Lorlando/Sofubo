import { mkdir, readdir, rename, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import env from '#start/env'
import { parsePhotoName, photoName } from '#services/photo_date'

export type Photo = { name: string; takenAt: Date }

/** Photos stored on disk, one file per upload, named after its UTC timestamp. */
export class PhotoStore {
  constructor(private dir: string) {}

  /** Writes the photo atomically (temp file + rename). */
  async save(jpeg: Buffer, at: Date = new Date()): Promise<Photo> {
    const name = photoName(at)
    await mkdir(this.dir, { recursive: true })
    const target = join(this.dir, name)
    await writeFile(`${target}.tmp`, jpeg)
    await rename(`${target}.tmp`, target)
    return { name, takenAt: parsePhotoName(name)! }
  }

  /** The most recent photo, or null when there is none (or no folder yet). */
  async latest(): Promise<Photo | null> {
    let names: string[]
    try {
      names = await readdir(this.dir)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }

    let latest: Photo | null = null
    for (const name of names) {
      const takenAt = parsePhotoName(name)
      if (takenAt && (!latest || takenAt > latest.takenAt)) latest = { name, takenAt }
    }
    return latest
  }

  /** Absolute path of a photo, or null when `name` is not a photo name. */
  path(name: string): string | null {
    return parsePhotoName(name) ? join(this.dir, name) : null
  }
}

/**
 * Resolved against the working directory (the repo root under PM2), never the
 * build folder: `node ace build` wipes `build/` on every deployment.
 */
export const photoStore = new PhotoStore(
  resolve(process.cwd(), env.get('PHOTOS_DIR') || 'storage/photos')
)
