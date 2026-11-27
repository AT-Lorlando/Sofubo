import { test } from '@japa/runner'
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PhotoStore } from '#services/photo_store'

test.group('PhotoStore', (group) => {
  let root: string

  group.each.setup(async () => {
    root = await mkdtemp(join(tmpdir(), 'sofubo-'))
    return () => rm(root, { recursive: true, force: true })
  })

  test('latest() is null when the folder does not exist', async ({ assert }) => {
    assert.isNull(await new PhotoStore(join(root, 'missing')).latest())
  })

  test('latest() is null when the folder is empty', async ({ assert }) => {
    await mkdir(join(root, 'photos'))
    assert.isNull(await new PhotoStore(join(root, 'photos')).latest())
  })

  test('save() creates the folder and writes the photo under its timestamp', async ({ assert }) => {
    const store = new PhotoStore(join(root, 'photos'))
    const at = new Date('2026-11-27T13:32:05Z')
    const photo = await store.save(Buffer.from('jpeg'), at)

    assert.deepEqual(photo, { name: '2026-11-27T13-32-05Z.jpg', takenAt: at })
    const content = await readFile(join(root, 'photos', '2026-11-27T13-32-05Z.jpg'), 'utf8')
    assert.equal(content, 'jpeg')
  })

  test('latest() returns the most recent photo and ignores other files', async ({ assert }) => {
    const store = new PhotoStore(join(root, 'photos'))
    await store.save(Buffer.from('b'), new Date('2026-11-27T08:00:00Z'))
    await store.save(Buffer.from('c'), new Date('2026-11-28T09:00:00Z'))
    await store.save(Buffer.from('a'), new Date('2026-11-26T20:00:00Z'))
    await writeFile(join(root, 'photos', 'notes.txt'), 'x')

    const latest = await store.latest()
    assert.equal(latest?.name, '2026-11-28T09-00-00Z.jpg')
    assert.equal(latest?.takenAt.toISOString(), '2026-11-28T09:00:00.000Z')
  })

  test('path() accepts only photo names', ({ assert }) => {
    const store = new PhotoStore(join(root, 'photos'))
    assert.equal(
      store.path('2026-11-27T13-32-05Z.jpg'),
      join(root, 'photos', '2026-11-27T13-32-05Z.jpg')
    )
    assert.isNull(store.path('../x'))
    assert.isNull(store.path('a.jpg'))
  })
})
