export type MaybeArray<T> = T | T[]

export type PagingParams = {
  page?: number | string | null
  size?: number | string | null
  sort?: MaybeArray<string> | null
}

export function toArray<T>(value?: MaybeArray<T> | null) {
  if (Array.isArray(value)) {
    const output = value.filter((item) => item != null && item !== '')
    return output.length > 0 ? output : undefined
  }
  return value != null && value !== '' ? [value] : undefined
}

export function toNumberParam(value?: number | string | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function toPositiveNumberParam(value?: number | string | null) {
  const parsed = toNumberParam(value)
  return parsed != null && parsed > 0 ? parsed : undefined
}

export function toNonNegativeNumberParam(value?: number | string | null) {
  const parsed = toNumberParam(value)
  return parsed != null && parsed >= 0 ? parsed : undefined
}

export function toNumericId(value: string | number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric id: ${value}`)
  }
  return parsed
}
