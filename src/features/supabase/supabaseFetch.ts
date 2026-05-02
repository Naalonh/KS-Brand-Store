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
    throw new Error(
      getSupabaseErrorMessage(errorText) ||
        `Supabase request failed: ${response.status}`,
    )
  }

  if (response.status === 204 || response.status === 205) {
    return null as T
  }

  const responseText = await response.text()

  if (!responseText.trim()) {
    return null as T
  }

  return JSON.parse(responseText) as T
}

const getSupabaseErrorMessage = (errorText: string) => {
  if (!errorText) {
    return ''
  }

  try {
    const errorBody = JSON.parse(errorText) as {
      details?: string
      hint?: string
      message?: string
    }

    return [errorBody.message, errorBody.details, errorBody.hint]
      .filter(Boolean)
      .join(' ')
  } catch {
    return errorText
  }
}
