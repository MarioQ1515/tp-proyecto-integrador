export async function apiFetch(path, options = {}) {
  const { auth = false, headers = {}, ...fetchOptions } = options
  const token = localStorage.getItem('token')
  const finalHeaders = { ...headers }

  if (auth && token) {
    finalHeaders.Authorization = `Bearer ${token}`
  }

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json'
  }

  const res = await fetch(path, {
    ...fetchOptions,
    headers: finalHeaders,
  })
  const data = await res.json().catch(() => null)

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  if (!res.ok) {
    const error = new Error(data?.mensaje || 'Error de conexión con la API')
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('token'))
}
