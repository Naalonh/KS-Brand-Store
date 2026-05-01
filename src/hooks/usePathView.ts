import { useCallback, useEffect, useState } from 'react'

export type View =
  | 'store'
  | 'admin'
  | 'adminLogin'
  | 'adminResetPassword'
  | 'mystore'
  | 'cart'

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/'

const getViewPath = (view: View) => {
  if (view === 'admin') {
    return '/admin/dashboard'
  }

  if (view === 'adminLogin') {
    return '/admin/login'
  }

  if (view === 'adminResetPassword') {
    return '/admin/reset-password'
  }

  if (view === 'mystore') {
    return '/mystore'
  }

  if (view === 'cart') {
    return '/cart'
  }

  return '/'
}

const getCurrentViewFromPath = (pathname: string): View => {
  const path = normalizePath(pathname)

  if (path === '/admin/login') {
    return 'adminLogin'
  }

  if (path === '/admin/reset-password') {
    return 'adminResetPassword'
  }

  if (path === '/admin' || path.startsWith('/admin/')) {
    return 'admin'
  }

  if (path === '/mystore') {
    return 'mystore'
  }

  if (path === '/cart') {
    return 'cart'
  }

  return 'store'
}

const getCurrentView = () => getCurrentViewFromPath(window.location.pathname)

export function usePathView() {
  const [currentPath, setCurrentPath] = useState(() =>
    normalizePath(window.location.pathname),
  )
  const [currentView, setCurrentView] = useState<View>(() =>
    window.location.hash === '#admin' ? 'admin' : getCurrentView(),
  )

  useEffect(() => {
    const syncViewFromPath = () => {
      const nextPath = normalizePath(window.location.pathname)

      setCurrentPath(nextPath)
      setCurrentView(getCurrentViewFromPath(nextPath))
    }

    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', '/admin/dashboard')
    }

    if (normalizePath(window.location.pathname) === '/admin') {
      window.history.replaceState(null, '', '/admin/dashboard')
    }

    syncViewFromPath()
    window.addEventListener('popstate', syncViewFromPath)

    return () => window.removeEventListener('popstate', syncViewFromPath)
  }, [])

  const openPath = useCallback(
    (path: string, options: { replace?: boolean } = {}) => {
      const nextPath = normalizePath(path)

      if (
        normalizePath(window.location.pathname) !== nextPath ||
        window.location.hash
      ) {
        const updateHistory = options.replace
          ? window.history.replaceState
          : window.history.pushState

        updateHistory.call(window.history, null, '', nextPath)
      }

      setCurrentPath(nextPath)
      setCurrentView(getCurrentViewFromPath(nextPath))
    },
    [],
  )

  const openView = useCallback(
    (view: View, options: { replace?: boolean } = {}) => {
      openPath(getViewPath(view), options)
    },
    [openPath],
  )

  return { currentPath, currentView, openPath, openView }
}
