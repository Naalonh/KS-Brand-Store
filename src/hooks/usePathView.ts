import { useCallback, useEffect, useState } from 'react'

export type View = 'store' | 'admin'

const getViewPath = (view: View) => (view === 'admin' ? '/admin' : '/')

const getCurrentView = (): View =>
  window.location.pathname.replace(/\/+$/, '') === '/admin' ? 'admin' : 'store'

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

  const openView = useCallback((view: View) => {
    const path = getViewPath(view)

    if (window.location.pathname !== path || window.location.hash) {
      window.history.pushState(null, '', path)
    }

    setCurrentView(view)
  }, [])

  return { currentView, openView }
}
