import { http } from './http'

export function getMe() {
  return http.get('/users/me')
}
