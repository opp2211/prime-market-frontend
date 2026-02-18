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

export function logoutServer() {
  return http.post('/auth/logout', null, { skipAuth: true })
}

export function oauthStart(provider) {
  // например: /api/auth/oauth/google или /api/auth/oauth/discord
  window.location.href = `/api/auth/oauth/${provider}`
}
