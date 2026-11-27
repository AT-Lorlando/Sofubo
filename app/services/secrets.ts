import { createHash, timingSafeEqual } from 'node:crypto'

const digest = (value: string) => createHash('sha256').update(value).digest()

/** Constant-time string comparison; false when either side is missing. */
export function safeEqual(a: unknown, b: unknown): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a === '' || b === '') return false
  return timingSafeEqual(digest(a), digest(b))
}
