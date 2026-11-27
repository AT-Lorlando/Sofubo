const TIME_ZONE = 'Europe/Paris'

const dayFormat = new Intl.DateTimeFormat('fr-FR', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const timeFormat = new Intl.DateTimeFormat('fr-FR', {
  timeZone: TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** "vendredi 27 novembre · 14 h 32", in Paris time. */
export function formatPhotoDate(date: Date): string {
  const parts = timeFormat.formatToParts(date)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value)
  const minute = parts.find((part) => part.type === 'minute')?.value
  return `${dayFormat.format(date)} · ${hour} h ${minute}`
}

const NAME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})Z\.jpg$/

/** File name of a photo uploaded at `date`: "2026-11-27T13-32-05Z.jpg" (UTC). */
export function photoName(date: Date): string {
  const iso = date.toISOString().slice(0, 19)
  return `${iso.replaceAll(':', '-')}Z.jpg`
}

/** Inverse of `photoName`; null for any other name. */
export function parsePhotoName(name: string): Date | null {
  const match = NAME_PATTERN.exec(name)
  if (!match) return null
  const [, y, mo, d, h, mi, s] = match
  const date = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`)
  if (Number.isNaN(date.getTime()) || photoName(date) !== name) return null
  return date
}
