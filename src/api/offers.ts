import { apiGet, apiPatch, apiPost, type ApiRequestBody } from './openapiClient'

export function getMyOffers() {
  return apiGet('/api/my/offers')
}

export function getOffer(offerCode: string) {
  return apiGet('/api/offers/{offerCode}', {
    path: { offerCode },
  })
}

export function getGames() {
  return apiGet('/api/games')
}

export function getGameCategories(gameSlug: string) {
  return apiGet('/api/games/{gameSlug}/categories', {
    path: { gameSlug },
  })
}

export function getOfferSchema(gameSlug: string, categorySlug: string) {
  return apiGet('/api/games/{gameSlug}/categories/{categorySlug}/offer-schema', {
    path: { categorySlug, gameSlug },
  })
}

export function createOffer(payload: ApiRequestBody<'/api/offers', 'post'>) {
  return apiPost('/api/offers', { body: payload })
}

export function updateOffer(
  offerCode: string,
  payload: ApiRequestBody<'/api/offers/{offerCode}', 'patch'>,
) {
  return apiPatch('/api/offers/{offerCode}', {
    body: payload,
    path: { offerCode },
  })
}
