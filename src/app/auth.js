import axios from 'axios'
import { useEffect, useState } from 'react'

const ACCESS_TOKEN_KEY = 'pm_access_token'
const TOKEN_TYPE_KEY = 'pm_token_type'

const listeners = new Set()

let authState = {
  accessToken: '',
  tokenType: 'Bearer',
  isReady: false,
}

function readStoredAuth() {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || ''
    const tokenType = localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer'
    return { accessToken, tokenType }
  } catch {
    return {}
  }
}

function persistAuth({ accessToken, tokenType }) {
  try {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(TOKEN_TYPE_KEY, tokenType || 'Bearer')
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(TOKEN_TYPE_KEY)
    }
  } catch {
    // ignore storage errors
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

const stored = readStoredAuth()
authState = { ...authState, ...stored }

const refreshClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export function getAuthSnapshot() {
  return {
    ...authState,
    isAuthed: Boolean(authState.accessToken),
  }
}

export function subscribeAuth(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAccessToken() {
  return authState.accessToken
}

export function getAuthHeader() {
  if (!authState.accessToken) return ''
  return `${authState.tokenType || 'Bearer'} ${authState.accessToken}`
}

export function setAuthFromResponse(data) {
  if (!data?.accessToken) return
  const accessToken = data.accessToken
  const tokenType = data.tokenType || 'Bearer'
  authState = { ...authState, accessToken, tokenType, isReady: true }
  persistAuth({ accessToken, tokenType })
  notify()
}

export function clearAuth() {
  authState = { ...authState, accessToken: '', tokenType: 'Bearer', isReady: true }
  persistAuth({ accessToken: '', tokenType: 'Bearer' })
  notify()
}

export async function refreshAccessToken() {
  return refreshClient.post('/auth/refresh')
}

export async function logout() {
  try {
    await refreshClient.post('/auth/logout')
  } finally {
    clearAuth()
  }
}

export async function bootstrapAuth() {
  if (authState.isReady) return
  if (authState.accessToken) {
    authState = { ...authState, isReady: true }
    notify()
    return
  }
  try {
    const res = await refreshAccessToken()
    setAuthFromResponse(res.data)
  } catch {
    clearAuth()
  }
}

export function useAuth() {
  const [snapshot, setSnapshot] = useState(getAuthSnapshot)

  useEffect(() => {
    const onChange = () => setSnapshot(getAuthSnapshot())
    const unsub = subscribeAuth(onChange)
    function onStorage(e) {
      if (e.key === ACCESS_TOKEN_KEY || e.key === TOKEN_TYPE_KEY) onChange()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      unsub()
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return snapshot
}
