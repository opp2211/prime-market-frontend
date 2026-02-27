export function formatAmount(value, fallback = '-', digits = 4) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return fallback
  return numberValue.toFixed(digits)
}

export function formatDateTime(value, fallback = '-', locale) {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  try {
    return date.toLocaleString(locale)
  } catch {
    return date.toString()
  }
}
