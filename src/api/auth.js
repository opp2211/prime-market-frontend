import { http } from './http'

export function loginLocal({ email, password }) {
  return http.post('/auth/login', { email, password })
}

export function registerLocal({ username, email, password }) {
  return http.post('/auth/register', { username, email, password })
}

export function verifyEmail({ token }) {
  return http.post('/auth/verify-email', { token }, { skipAuth: true })
}

export function resendVerification({ email }) {
  return http.post('/auth/resend-verification', { email }, { skipAuth: true })
}

export function oauthStart(provider) {
  window.location.href = `/api/auth/oauth/${provider}`
}


