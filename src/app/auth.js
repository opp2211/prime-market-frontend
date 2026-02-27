import axios from 'axios'
import { useSyncExternalStore } from 'react'
import {
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from '../shared/lib/storage'

const ACCESS_TOKEN_KEY = 'pm_access_token'
const TOKEN_TYPE_KEY = 'pm_token_type'

const listeners = new Set()

let authState = {
  accessToken: '',
  tokenType: 'Bearer',
  isReady: false,
  isAuthed: false,
}

function setAuthState(next) {
  const merged = { ...authState, ...next }
  authState = { ...merged, isAuthed: Boolean(merged.accessToken) }
}

function readStoredAuth() {
  const accessToken = readLocalStorage(ACCESS_TOKEN_KEY) || ''
  const tokenType = readLocalStorage(TOKEN_TYPE_KEY) || 'Bearer'
  return { accessToken, tokenType }
}

function persistAuth({ accessToken, tokenType }) {
  if (accessToken) {
    writeLocalStorage(ACCESS_TOKEN_KEY, accessToken)
    writeLocalStorage(TOKEN_TYPE_KEY, tokenType || 'Bearer')
  } else {
    removeLocalStorage(ACCESS_TOKEN_KEY)
    removeLocalStorage(TOKEN_TYPE_KEY)
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

function syncAuthFromStorage() {
  setAuthState(readStoredAuth())
  notify()
}

setAuthState(readStoredAuth())

const refreshClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export function getAuthSnapshot() {
  return authState
}

export function subscribeAuth(listener) {
  listeners.add(listener)
  const onStorage = (e) => {
    if (e.key === ACCESS_TOKEN_KEY || e.key === TOKEN_TYPE_KEY) syncAuthFromStorage()
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage)
  }
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage)
    }
  }
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
  setAuthState({ accessToken, tokenType, isReady: true })
  persistAuth({ accessToken, tokenType })
  notify()
}

export function clearAuth() {
  setAuthState({ accessToken: '', tokenType: 'Bearer', isReady: true })
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
    setAuthState({ isReady: true })
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
  return useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthSnapshot)
}
