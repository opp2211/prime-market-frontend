import axios from 'axios'
import { clearAuth, getAuthHeader, getAccessToken, refreshAccessToken, setAuthFromResponse } from '../app/auth'

export const http = axios.create({
  baseURL: '/api',
  withCredentials: true, // refresh-token в httpOnly cookie
})

function isAuthEndpoint(url = '') {
  return url.includes('/auth/')
}

http.interceptors.request.use((config) => {
  if (config?.skipAuth) return config
  const token = getAccessToken()
  if (token) {
    config.headers = { ...config.headers, Authorization: getAuthHeader() }
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {}
    if (!response || response.status !== 401 || !config) return Promise.reject(err)
    if (config._retry || config.skipAuth || isAuthEndpoint(config.url)) return Promise.reject(err)
    config._retry = true

    try {
      const refreshRes = await refreshAccessToken()
      setAuthFromResponse(refreshRes.data)
      const authHeader = getAuthHeader()
      if (authHeader) {
        config.headers = { ...config.headers, Authorization: authHeader }
      }
      return http(config)
    } catch (refreshErr) {
      clearAuth()
      return Promise.reject(refreshErr)
    }
  }
)
