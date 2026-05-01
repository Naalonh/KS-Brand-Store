import { getSupabaseHeaders, supabaseConfig } from './supabaseConfig'

type SupabaseFetchOptions = {
  accessToken?: string
  body?: unknown
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST'
  prefer?: string
}

export async function supabaseFetch<T>(
  path: string,
  { accessToken, body, method = 'GET', prefer }: SupabaseFetchOptions = {},
) {
  const response = await fetch(`${supabaseConfig.url}${path}`, {
    method,
    headers: {
      ...getSupabaseHeaders(accessToken),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Supabase request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}
