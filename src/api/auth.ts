import { apiPost, type ApiRequestBody } from './openapiClient'

export function loginLocal(payload: ApiRequestBody<'/api/auth/login', 'post'>) {
  return apiPost('/api/auth/login', { body: payload, skipAuth: true })
}

export function registerLocal(payload: ApiRequestBody<'/api/auth/register', 'post'>) {
  return apiPost('/api/auth/register', { body: payload, skipAuth: true })
}

export function verifyEmail(payload: ApiRequestBody<'/api/auth/verify-email', 'post'>) {
  return apiPost('/api/auth/verify-email', { body: payload, skipAuth: true })
}

export function resendVerification(payload: ApiRequestBody<'/api/auth/resend-verification', 'post'>) {
  return apiPost('/api/auth/resend-verification', { body: payload, skipAuth: true })
}

export function oauthStart(provider: string) {
  window.location.href = `/api/auth/oauth/${provider}`
}
