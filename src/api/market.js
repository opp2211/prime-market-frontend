import { http } from './http'

export function getMarketGames() {
  return http.get('/games')
}

export function getMarketCurrencies() {
  return http.get('/currencies')
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

export function getMarketOfferDetails(offerCode, params) {
  return http.get(`/market/offers/${offerCode}`, { params })
}

export function createMarketOfferQuote(offerCode, payload) {
  return http.post(`/market/offers/${offerCode}/quote`, payload)
}

export function refreshMarketOfferQuote(quoteId) {
  return http.post(`/order-quotes/${quoteId}/refresh`)
}
