export const HEADER_LAB_VARIANT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const HEADER_LAB_VARIANT_SET = new Set(HEADER_LAB_VARIANT_IDS)
const HEADER_LAB_DOCK_VARIANT_SET = new Set([3, 4, 7])

export function normalizeHeaderLabVariantId(value) {
  const numericValue = Number(value)
  return HEADER_LAB_VARIANT_SET.has(numericValue) ? numericValue : null
}

export function getHeaderLabVariantId(pathname = '') {
  const match = /^\/header-lab-(\d+)$/.exec(pathname)
  return normalizeHeaderLabVariantId(match?.[1] || '')
}

export function isHeaderLabRoute(pathname = '') {
  return pathname === '/header-lab' || getHeaderLabVariantId(pathname) != null
}

export function isHeaderLabDockVariant(variantId) {
  return HEADER_LAB_DOCK_VARIANT_SET.has(Number(variantId))
}
