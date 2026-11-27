import { test } from '@japa/runner'
import { formatPhotoDate, parsePhotoName, photoName } from '#services/photo_date'

test.group('formatPhotoDate', () => {
  test('formats in French, Paris time (winter)', ({ assert }) => {
    assert.equal(
      formatPhotoDate(new Date('2026-11-27T13:32:00Z')),
      'vendredi 27 novembre · 14 h 32'
    )
  })

  test('formats in French, Paris time (summer, single-digit hour)', ({ assert }) => {
    assert.equal(formatPhotoDate(new Date('2026-07-01T07:05:00Z')), 'mercredi 1 juillet · 9 h 05')
  })
})

test.group('photoName / parsePhotoName', () => {
  test('names a photo after its UTC timestamp', ({ assert }) => {
    assert.equal(photoName(new Date('2026-11-27T13:32:05.123Z')), '2026-11-27T13-32-05Z.jpg')
  })

  test('parses a name back to its date', ({ assert }) => {
    assert.equal(
      parsePhotoName('2026-11-27T13-32-05Z.jpg')?.toISOString(),
      '2026-11-27T13:32:05.000Z'
    )
  })

  test('rejects anything else', ({ assert }) => {
    assert.isNull(parsePhotoName('../.env'))
    assert.isNull(parsePhotoName('2026-11-27T13-32-05Z.png'))
    assert.isNull(parsePhotoName('2026-11-27T13-32-05Z.jpg/../x'))
    assert.isNull(parsePhotoName('2026-13-45T99-99-99Z.jpg'))
  })
})
