export function copyToClipboard(text) {
  if (text == null || text === '') return false
  const value = String(text)

  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(value)
    return true
  }

  if (typeof document === 'undefined') return false

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    return true
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}
