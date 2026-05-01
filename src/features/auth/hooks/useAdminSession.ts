import { useEffect, useState } from 'react'
import {
  restoreAdminSession,
  signInAdmin,
  type AdminSession,
} from '../services/authService'

const SESSION_KEY = 'ks-brand-store-admin-session'

const readSavedSession = () => {
  const savedSession =
    window.localStorage.getItem(SESSION_KEY) ??
    window.sessionStorage.getItem(SESSION_KEY)

  if (!savedSession) {
    return null
  }

  try {
    const parsedSession = JSON.parse(savedSession) as AdminSession

    if (!parsedSession.email || !parsedSession.source) {
      return null
    }

    return parsedSession
  } catch {
    return null
  }
}

const saveSession = (session: AdminSession) => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.sessionStorage.removeItem(SESSION_KEY)
}

const clearSavedSession = () => {
  window.localStorage.removeItem(SESSION_KEY)
  window.sessionStorage.removeItem(SESSION_KEY)
}

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(readSavedSession)
  const [isRestoring, setIsRestoring] = useState(() =>
    Boolean(readSavedSession()),
  )

  useEffect(() => {
    let isMounted = true
    const savedSession = readSavedSession()

    if (!savedSession) {
      return
    }

    const restoreSession = async () => {
      setIsRestoring(true)

      try {
        const restoredSession = await restoreAdminSession(savedSession)

        if (isMounted) {
          setSession(restoredSession)
        }
      } catch {
        if (isMounted) {
          setSession(null)
        }
      } finally {
        if (isMounted) {
          setIsRestoring(false)
        }
      }
    }

    void restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (session) {
      saveSession(session)
    } else {
      clearSavedSession()
    }
  }, [session])

  const login = async (email: string, password: string) => {
    const nextSession = await signInAdmin(email, password)
    setSession(nextSession)
    return true
  }

  const logout = () => {
    setIsRestoring(false)
    setSession(null)
    clearSavedSession()
  }

  return {
    accessToken: session?.accessToken,
    email: session?.email,
    isAuthenticated: Boolean(session),
    isRestoring,
    login,
    logout,
    source: session?.source,
  }
}
