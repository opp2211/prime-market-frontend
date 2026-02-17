export function getErrorMessage(err, fallback) {
  if (!err) return fallback

  const status = err?.response?.status
  const data = err?.response?.data

  if (typeof data === 'string' && data.trim()) return data

  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string' && data.detail.trim()) return data.detail
    if (typeof data.title === 'string' && data.title.trim()) return data.title
    if (typeof data.message === 'string' && data.message.trim()) return data.message
    if (typeof data.error === 'string' && data.error.trim()) return data.error
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const text = data.errors.map((e) => e?.message || e).filter(Boolean).join(', ')
      if (text) return text
    }
  }

  if (typeof err.message === 'string' && err.message.trim()) {
    return status ? `${err.message} (HTTP ${status})` : err.message
  }

  return status ? `${fallback} (HTTP ${status})` : fallback
}
