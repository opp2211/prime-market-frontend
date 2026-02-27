export function readLocalStorage(key) {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeLocalStorage(key, value) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore storage errors
  }
}

export function removeLocalStorage(key) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore storage errors
  }
}
