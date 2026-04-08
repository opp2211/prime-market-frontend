import { http } from './http'

export function getMyOffers() {
  return http.get('/my/offers')
}

export function getOffer(offerId) {
  return http.get(`/offers/${offerId}`)
}

export function getGames() {
  return http.get('/games')
}

export function getGameCategories(gameSlug) {
  return http.get(`/games/${gameSlug}/categories`)
}

export function getOfferSchema(gameSlug, categorySlug) {
  return http.get(`/games/${gameSlug}/categories/${categorySlug}/offer-schema`)
}

export function createOffer(payload) {
  return http.post('/offers', payload)
}

export function updateOffer(offerId, payload) {
  return http.patch(`/offers/${offerId}`, payload)
}
