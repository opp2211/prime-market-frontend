import {
  clearAuth,
  getAccessToken,
  getAuthHeader,
  refreshAccessToken,
  setAuthFromResponse,
} from '../app/auth'
import type { paths } from './generated/schema'

type HttpMethod = 'get' | 'post' | 'patch' | 'delete'
type QueryValue = string | number | boolean
type QueryParams = Record<string, QueryValue | QueryValue[] | null | undefined>
type PathParams = Record<string, QueryValue>

type OperationPath<M extends HttpMethod> = {
  [P in keyof paths]: paths[P][M] extends never | undefined ? never : P
}[keyof paths]

type Operation<P extends keyof paths, M extends HttpMethod> = NonNullable<paths[P][M]>

type OperationParameters<P extends keyof paths, M extends HttpMethod> =
  Operation<P, M> extends { parameters: infer Params } ? Params : never

type OperationQuery<P extends keyof paths, M extends HttpMethod> =
  OperationParameters<P, M> extends { query?: infer Query } ? Query : never

type OperationPathParams<P extends keyof paths, M extends HttpMethod> =
  OperationParameters<P, M> extends { path: infer Params } ? Params : never

type OperationRequestBody<P extends keyof paths, M extends HttpMethod> =
  Operation<P, M> extends { requestBody: { content: { 'application/json': infer Body } } }
    ? Body
    : never

export type ApiQuery<P extends keyof paths, M extends HttpMethod> = OperationQuery<P, M>
export type ApiPathParams<P extends keyof paths, M extends HttpMethod> = OperationPathParams<P, M>
export type ApiRequestBody<P extends keyof paths, M extends HttpMethod> =
  OperationRequestBody<P, M>

type ResponseContent<Response> = Response extends {
  content: infer Content
}
  ? Content extends { 'application/json': infer Json }
    ? Json
    : Content extends { '*/*': infer AnyContent }
      ? AnyContent
      : unknown
  : undefined

type SuccessResponse<Responses> = Responses extends {
  200: infer Ok
}
  ? Ok
  : Responses extends { 201: infer Created }
    ? Created
    : Responses extends { 204: infer NoContent }
      ? NoContent
      : unknown

export type ApiData<
  P extends keyof paths,
  M extends HttpMethod,
> = Operation<P, M> extends { responses: infer Responses }
  ? ResponseContent<SuccessResponse<Responses>>
  : unknown

export type ApiResponse<T> = {
  data: T
  status: number
  headers: Headers
  response: Response
}

type RequestOptions<P extends keyof paths, M extends HttpMethod> = {
  params?: OperationQuery<P, M> extends never ? QueryParams : OperationQuery<P, M>
  path?: OperationPathParams<P, M> extends never
    ? PathParams
    : OperationPathParams<P, M>
  body?: OperationRequestBody<P, M> extends never ? unknown : OperationRequestBody<P, M>
  headers?: HeadersInit
  skipAuth?: boolean
}

export class ApiError extends Error {
  response: {
    data: unknown
    headers: Headers
    status: number
  }

  status: number
  data: unknown

  constructor(message: string, response: Response, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = response.status
    this.data = data
    this.response = {
      data,
      headers: response.headers,
      status: response.status,
    }
  }
}

function isAuthEndpoint(url: string) {
  return url.includes('/api/auth/')
}

function resolvePath(path: string, params?: PathParams) {
  return path.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = params?.[key]
    if (value == null) {
      throw new Error(`Missing path parameter: ${key}`)
    }
    return encodeURIComponent(String(value))
  })
}

function appendQuery(url: string, params?: QueryParams) {
  if (!params) return url

  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && item !== '') {
          query.append(key, String(item))
        }
      })
      return
    }

    query.set(key, String(value))
  })

  const output = query.toString()
  return output ? `${url}?${output}` : url
}

async function parseResponse(response: Response) {
  if (response.status === 204) return undefined

  const text = await response.text()
  if (!text) return undefined

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  return text
}

async function fetchWithAuth(url: string, init: RequestInit, skipAuth?: boolean) {
  const headers = new Headers(init.headers)
  const shouldAuth = !skipAuth && !isAuthEndpoint(url)
  const token = getAccessToken()

  if (shouldAuth && token) {
    headers.set('Authorization', getAuthHeader())
  }

  const requestInit = {
    ...init,
    credentials: 'include' as RequestCredentials,
    headers,
  }

  let response = await fetch(url, requestInit)

  if (response.status !== 401 || !shouldAuth) {
    return response
  }

  try {
    const refreshRes = await refreshAccessToken()
    setAuthFromResponse(refreshRes.data)
    const authHeader = getAuthHeader()
    if (authHeader) {
      headers.set('Authorization', authHeader)
    }
    response = await fetch(url, requestInit)
    return response
  } catch (err) {
    clearAuth()
    throw err
  }
}

async function apiRequest<
  M extends HttpMethod,
  P extends OperationPath<M> & keyof paths,
>(method: M, path: P, options: RequestOptions<P, M> = {}) {
  const url = appendQuery(
    resolvePath(String(path), options.path as PathParams | undefined),
    options.params as QueryParams | undefined,
  )
  const headers = new Headers(options.headers)
  const init: RequestInit = { method: method.toUpperCase(), headers }

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    init.body = JSON.stringify(options.body)
  }

  const response = await fetchWithAuth(url, init, options.skipAuth)
  const data = await parseResponse(response)

  if (!response.ok) {
    const message = response.statusText || `HTTP ${response.status}`
    throw new ApiError(message, response, data)
  }

  return {
    data: data as ApiData<P, M>,
    headers: response.headers,
    response,
    status: response.status,
  } satisfies ApiResponse<ApiData<P, M>>
}

export function apiGet<P extends OperationPath<'get'> & keyof paths>(
  path: P,
  options?: RequestOptions<P, 'get'>,
) {
  return apiRequest('get', path, options)
}

export function apiPost<P extends OperationPath<'post'> & keyof paths>(
  path: P,
  options?: RequestOptions<P, 'post'>,
) {
  return apiRequest('post', path, options)
}

export function apiPatch<P extends OperationPath<'patch'> & keyof paths>(
  path: P,
  options?: RequestOptions<P, 'patch'>,
) {
  return apiRequest('patch', path, options)
}

export function apiDelete<P extends OperationPath<'delete'> & keyof paths>(
  path: P,
  options?: RequestOptions<P, 'delete'>,
) {
  return apiRequest('delete', path, options)
}
