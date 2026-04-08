import { http } from './http'

export function getMarketGames() {
  return http.get('/games')
}

export function getMarketCategories(gameSlug) {
  return http.get(`/games/${gameSlug}/categories`)
}

export function getMarketOfferSchema(gameSlug, categorySlug) {
  return http.get(`/games/${gameSlug}/categories/${categorySlug}/offer-schema`)
}

export function getMarketOffers(params) {
  return http.get('/market/offers', { params })
}

export function getMarketOfferDetails(offerId, params) {
  return http.get(`/market/offers/${offerId}`, { params })
}
