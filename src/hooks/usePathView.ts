import { useCallback, useEffect, useState } from 'react'

export type View = 'store' | 'admin' | 'adminLogin'

const getViewPath = (view: View) => {
  if (view === 'admin') {
    return '/admin'
  }

  if (view === 'adminLogin') {
    return '/admin/login'
  }

  return '/'
}

const getCurrentView = (): View => {
  const path = window.location.pathname.replace(/\/+$/, '')

  if (path === '/admin') {
    return 'admin'
  }

  if (path === '/admin/login') {
    return 'adminLogin'
  }

  return 'store'
}

export function usePathView() {
  const [currentView, setCurrentView] = useState<View>(() =>
    window.location.hash === '#admin' ? 'admin' : getCurrentView(),
  )

  useEffect(() => {
    const syncViewFromPath = () => {
      setCurrentView(getCurrentView())
    }

    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', '/admin')
    }

    syncViewFromPath()
    window.addEventListener('popstate', syncViewFromPath)

    return () => window.removeEventListener('popstate', syncViewFromPath)
  }, [])

  const openView = useCallback(
    (view: View, options: { replace?: boolean } = {}) => {
      const path = getViewPath(view)

      if (window.location.pathname !== path || window.location.hash) {
        const updateHistory = options.replace
          ? window.history.replaceState
          : window.history.pushState

        updateHistory.call(window.history, null, '', path)
      }

      setCurrentView(view)
    },
    [],
  )

  return { currentView, openView }
}
