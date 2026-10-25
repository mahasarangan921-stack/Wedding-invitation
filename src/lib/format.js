const parse = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
export const longDate = (iso) =>
  parse(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).toUpperCase()
export const weekday = (iso) =>
  parse(iso).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })
