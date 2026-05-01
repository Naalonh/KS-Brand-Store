import { adminAuthConfig, isLocalAdminAuthConfigured } from '../authConfig'
import {
  getSupabaseHeaders,
  isSupabaseConfigured,
  supabaseConfig,
} from '../../supabase/supabaseConfig'

type SupabasePasswordSession = {
  access_token: string
  expires_at?: number
  expires_in?: number
  refresh_token?: string
  user?: {
    email?: string
    id: string
  }
}

export type AdminSession = {
  accessToken?: string
  email: string
  expiresAt?: number
  refreshToken?: string
  source: 'local' | 'supabase'
}

type SupabaseUser = {
  email?: string
}

const TOKEN_REFRESH_MARGIN_SECONDS = 60
const WRONG_EMAIL_MESSAGE = 'Wrong email.'
const DEFAULT_RESET_RETRY_AFTER_SECONDS = 65
const RESET_RATE_LIMIT_MESSAGE =
  'Too many reset emails. Please wait before sending another link.'

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const isUserNotFoundError = (message: string) =>
  /not found|user.*not.*found|email.*not.*found|invalid email/i.test(message)

const isRateLimitError = (message: string) =>
  /rate limit|too many|429/i.test(message)

export class PasswordResetRateLimitError extends Error {
  retryAfterSeconds: number

  constructor(retryAfterSeconds = DEFAULT_RESET_RETRY_AFTER_SECONDS) {
    super(RESET_RATE_LIMIT_MESSAGE)
    this.name = 'PasswordResetRateLimitError'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

const getRetryAfterSeconds = (response: Response) => {
  const retryAfter = response.headers.get('Retry-After')

  if (!retryAfter) {
    return DEFAULT_RESET_RETRY_AFTER_SECONDS
  }

  const retryAfterSeconds = Number(retryAfter)

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.ceil(retryAfterSeconds)
  }

  const retryAfterDate = Date.parse(retryAfter)

  if (!Number.isNaN(retryAfterDate)) {
    return Math.max(
      DEFAULT_RESET_RETRY_AFTER_SECONDS,
      Math.ceil((retryAfterDate - Date.now()) / 1000),
    )
  }

  return DEFAULT_RESET_RETRY_AFTER_SECONDS
}

const getSessionExpiresAt = (session: SupabasePasswordSession) =>
  session.expires_at ??
  (session.expires_in
    ? Math.floor(Date.now() / 1000) + session.expires_in
    : undefined)

const mapSupabaseSession = (
  session: SupabasePasswordSession,
  fallbackEmail: string,
): AdminSession => ({
  accessToken: session.access_token,
  email: session.user?.email ?? fallbackEmail,
  expiresAt: getSessionExpiresAt(session),
  refreshToken: session.refresh_token,
  source: 'supabase',
})

const shouldRefreshSession = (session: AdminSession) =>
  Boolean(
    session.expiresAt &&
      session.expiresAt <=
        Math.floor(Date.now() / 1000) + TOKEN_REFRESH_MARGIN_SECONDS,
  )

export async function signInAdmin(email: string, password: string) {
  if (!isSupabaseConfigured) {
    if (!import.meta.env.DEV) {
      throw new Error('Supabase environment variables are missing.')
    }

    if (!isLocalAdminAuthConfigured) {
      throw new Error('Local admin credentials are missing.')
    }

    const isValidLocalLogin =
      email.trim().toLowerCase() === adminAuthConfig.email.toLowerCase() &&
      password === adminAuthConfig.password

    if (!isValidLocalLogin) {
      throw new Error('Invalid admin email or password.')
    }

    return {
      email: adminAuthConfig.email,
      source: 'local',
    } satisfies AdminSession
  }

  const response = await fetch(
    `${supabaseConfig.url}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify({ email, password }),
    },
  )

  if (!response.ok) {
    const errorMessage = await getSupabaseAuthError(response)
    throw new Error(errorMessage)
  }

  const data = (await response.json()) as SupabasePasswordSession

  return mapSupabaseSession(data, email)
}

export async function requestAdminPasswordReset(email: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase environment variables are missing.')
  }

  const normalizedEmail = normalizeEmail(email)

  if (
    adminAuthConfig.email &&
    normalizedEmail !== normalizeEmail(adminAuthConfig.email)
  ) {
    throw new Error(WRONG_EMAIL_MESSAGE)
  }

  const response = await fetch(`${supabaseConfig.url}/auth/v1/recover`, {
    method: 'POST',
    headers: getSupabaseHeaders(),
    body: JSON.stringify({
      email: normalizedEmail,
      redirect_to: `${window.location.origin}/admin/reset-password`,
    }),
  })

  if (!response.ok) {
    const errorMessage = await getSupabaseAuthError(response)
    if (isUserNotFoundError(errorMessage)) {
      throw new Error(WRONG_EMAIL_MESSAGE)
    }

    if (response.status === 429 || isRateLimitError(errorMessage)) {
      throw new PasswordResetRateLimitError(getRetryAfterSeconds(response))
    }

    throw new Error(errorMessage)
  }
}

export async function updateAdminPassword(
  accessToken: string,
  password: string,
) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase environment variables are missing.')
  }

  const response = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
    method: 'PUT',
    headers: getSupabaseHeaders(accessToken),
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    const errorMessage = await getSupabaseAuthError(response)
    throw new Error(errorMessage)
  }
}

export async function restoreAdminSession(session: AdminSession) {
  if (session.source === 'local') {
    return session
  }

  if (!isSupabaseConfigured || !session.accessToken) {
    return null
  }

  if (shouldRefreshSession(session)) {
    if (!session.refreshToken) {
      return null
    }

    return refreshSupabaseSession(session)
  }

  const user = await getCurrentSupabaseUser(session.accessToken)

  return {
    ...session,
    email: user.email ?? session.email,
  } satisfies AdminSession
}

async function refreshSupabaseSession(session: AdminSession) {
  const response = await fetch(
    `${supabaseConfig.url}/auth/v1/token?grant_type=refresh_token`,
    {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    },
  )

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as SupabasePasswordSession
  const nextSession = mapSupabaseSession(data, session.email)

  return {
    ...nextSession,
    refreshToken: nextSession.refreshToken ?? session.refreshToken,
  } satisfies AdminSession
}

async function getCurrentSupabaseUser(accessToken: string) {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
    headers: getSupabaseHeaders(accessToken),
  })

  if (!response.ok) {
    throw new Error('Saved admin session is no longer valid.')
  }

  return (await response.json()) as SupabaseUser
}

async function getSupabaseAuthError(response: Response) {
  try {
    const errorBody = (await response.json()) as {
      error?: string
      error_description?: string
      msg?: string
    }

    return (
      errorBody.error_description ??
      errorBody.msg ??
      errorBody.error ??
      'Invalid Supabase admin email or password.'
    )
  } catch {
    return 'Invalid Supabase admin email or password.'
  }
}
