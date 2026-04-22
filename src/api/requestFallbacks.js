function isRouteMismatch(error) {
  const status = error?.response?.status
  return status === 404 || status === 405
}

export async function runRequestVariants(requests) {
  let lastError = null

  for (const request of requests) {
    try {
      return await request()
    } catch (error) {
      lastError = error
      if (!isRouteMismatch(error)) throw error
    }
  }

  throw lastError
}
