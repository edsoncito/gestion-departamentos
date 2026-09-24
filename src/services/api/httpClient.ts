const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

interface ApiRequestOptions extends RequestInit {
  path: string
}

export async function apiRequest<T>({ path, ...options }: ApiRequestOptions) {
  if (!API_URL) {
    throw new Error('VITE_API_URL no está configurada')
  }

  const response = await fetch(`${API_URL}/${path.replace(/^\//, '')}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`La solicitud falló con estado ${response.status}`)
  }

  return (await response.json()) as T
}
