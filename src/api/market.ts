import { toNumericId } from './apiParams'
import { apiGet, apiPost, type ApiQuery, type ApiRequestBody } from './openapiClient'

export function getMarketGames() {
  return apiGet('/api/games')
}

export function getMarketCurrencies() {
  return apiGet('/api/currencies')
}

export function getMarketCategories(gameSlug: string) {
  return apiGet('/api/games/{gameSlug}/categories', {
    path: { gameSlug },
  })
}

export function getMarketOfferSchema(gameSlug: string, categorySlug: string) {
  return apiGet('/api/games/{gameSlug}/categories/{categorySlug}/offer-schema', {
    path: { categorySlug, gameSlug },
  })
}

export function getMarketOffers(params: Record<string, unknown>) {
  return apiGet('/api/market/offers', {
    params: params as ApiQuery<'/api/market/offers', 'get'>,
  })
}

export function getMarketOfferDetails(
  offerCode: string,
  params: ApiQuery<'/api/market/offers/{offerCode}', 'get'>,
) {
  return apiGet('/api/market/offers/{offerCode}', {
    params,
    path: { offerCode },
  })
}

export function createMarketOfferQuote(
  offerCode: string,
  payload: ApiRequestBody<'/api/market/offers/{offerCode}/quote', 'post'>,
) {
  return apiPost('/api/market/offers/{offerCode}/quote', {
    body: payload,
    path: { offerCode },
  })
}

export function refreshMarketOfferQuote(quoteId: string | number) {
  return apiPost('/api/order-quotes/{quoteId}/refresh', {
    path: { quoteId: toNumericId(quoteId) },
  })
}
