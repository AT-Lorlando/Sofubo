import { test } from '@japa/runner'

test.group('Health', () => {
  test('unknown route answers 404', async ({ client }) => {
    const response = await client.get('/nope')
    response.assertStatus(404)
  })
})
