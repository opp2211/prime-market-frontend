import { useSyncExternalStore } from 'react'
import { getMe } from '../api/users'

const listeners = new Set()

let userState = {
  user: null,
  permissions: [],
  roles: [],
  status: 'idle',
  error: '',
}

function setUserState(next) {
  userState = { ...userState, ...next }
}

function notify() {
  listeners.forEach((listener) => listener())
}

export function getUserSnapshot() {
  return userState
}

export function subscribeUser(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useUser() {
  return useSyncExternalStore(subscribeUser, getUserSnapshot, getUserSnapshot)
}

export function clearUser() {
  setUserState({
    user: null,
    permissions: [],
    roles: [],
    status: 'idle',
    error: '',
  })
  notify()
}

export async function loadUser() {
  if (userState.status === 'loading') return
  setUserState({ status: 'loading', error: '' })
  notify()
  try {
    const res = await getMe()
    const data = res?.data || null
    const permissions = Array.isArray(data?.permissions) ? data.permissions : []
    const roles = Array.isArray(data?.roles) ? data.roles : []
    setUserState({
      user: data,
      permissions,
      roles,
      status: 'ready',
      error: '',
    })
  } catch (err) {
    setUserState({
      user: null,
      permissions: [],
      roles: [],
      status: 'error',
      error: err?.message || 'Failed to load user',
    })
  } finally {
    notify()
  }
}
