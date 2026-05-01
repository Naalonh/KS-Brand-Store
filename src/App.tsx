import { useCallback, useEffect, useState } from 'react'
import { AdminPage } from './features/admin/AdminPage'
import {
  getAdminSectionFromPath,
  getAdminSectionPath,
  isAdminSectionPath,
  type AdminSection,
} from './features/admin/adminSections'
import { LoginPage } from './features/auth/components/LoginPage'
import { ResetPasswordPage } from './features/auth/components/ResetPasswordPage'
import { useAdminSession } from './features/auth/hooks/useAdminSession'
import type { AdminSession } from './features/auth/services/authService'
import { CartPage } from './features/cart/CartPage'
import { useCategories } from './features/categories/hooks/useCategories'
import { MyStorePage } from './features/mystore/MyStorePage'
import { useProducts } from './features/products/hooks/useProducts'
import { useSizes } from './features/sizes/hooks/useSizes'
import { StorePage } from './features/store/StorePage'
import { usePathView } from './hooks/usePathView'
import { AppHeader } from './shared/layout/AppHeader'

const adminTitles: Record<AdminSection, string> = {
  categories: 'Dashboard / Categories',
  dashboard: 'Dashboard',
  orders: 'Dashboard / Orders',
  products: 'Dashboard / Products',
  size: 'Dashboard / Size',
}

type Theme = 'dark' | 'light'
type Language = 'en' | 'km'

const THEME_KEY = 'ks-brand-store-theme'
const LANGUAGE_KEY = 'ks-brand-store-language'

const getSavedTheme = (): Theme => {
  const savedTheme = window.localStorage.getItem(THEME_KEY)

  return savedTheme === 'light' ? 'light' : 'dark'
}

const getSavedLanguage = (): Language => {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_KEY)

  return savedLanguage === 'km' ? 'km' : 'en'
}

function App() {
  const { currentPath, currentView, openPath, openView } = usePathView()
  const [theme, setTheme] = useState<Theme>(getSavedTheme)
  const [language, setLanguage] = useState<Language>(getSavedLanguage)
  const [adminSection, setAdminSection] = useState<AdminSection>(() =>
    getAdminSectionFromPath(window.location.pathname),
  )
  const adminSession = useAdminSession()
  const categoriesState = useCategories(adminSession.accessToken)
  const productsState = useProducts(adminSession.accessToken)
  const sizesState = useSizes(adminSession.accessToken)

  const isAdminRoute = currentView === 'admin'
  const isAdminLoginRoute = currentView === 'adminLogin'
  const isAdminResetPasswordRoute = currentView === 'adminResetPassword'
  const isAdminAreaRoute =
    isAdminRoute || isAdminLoginRoute || isAdminResetPasswordRoute
  const canShowAdmin = isAdminRoute && adminSession.isAuthenticated
  const isRedirectingAuthenticatedLogin =
    isAdminLoginRoute && adminSession.isAuthenticated

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_KEY, language)
  }, [language])

  useEffect(() => {
    if (currentView !== 'admin') {
      return
    }

    const nextSection = getAdminSectionFromPath(currentPath)
    setAdminSection(nextSection)

    if (!isAdminSectionPath(currentPath)) {
      openPath(getAdminSectionPath(nextSection), { replace: true })
    }
  }, [currentPath, currentView, openPath])

  const openAdminSection = useCallback(
    (section: AdminSection, options: { replace?: boolean } = {}) => {
      setAdminSection(section)
      openPath(getAdminSectionPath(section), options)
    },
    [openPath],
  )

  useEffect(() => {
    if (adminSession.isRestoring) {
      return
    }

    if (isAdminRoute && !adminSession.isAuthenticated) {
      openView('adminLogin', { replace: true })
    }

    if (isAdminLoginRoute && adminSession.isAuthenticated) {
      openAdminSection(adminSection, { replace: true })
    }
  }, [
    adminSection,
    adminSession.isAuthenticated,
    adminSession.isRestoring,
    isAdminLoginRoute,
    isAdminRoute,
    openAdminSection,
    openView,
  ])

  const handleAdminLogin = async (email: string, password: string) => {
    const isLoggedIn = await adminSession.login(email, password)
    openAdminSection(adminSection)
    return isLoggedIn
  }

  const handleAdminOtpLogin = (session: AdminSession) => {
    const isLoggedIn = adminSession.loginWithSession(session)
    openView('adminResetPassword')
    return isLoggedIn
  }

  const openProductManagement = () => {
    openView(adminSession.isAuthenticated ? 'admin' : 'adminLogin')
  }

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark',
    )
  }

  const toggleLanguage = () => {
    setLanguage((currentLanguage) =>
      currentLanguage === 'en' ? 'km' : 'en',
    )
  }

  return (
    <div
      className="min-h-screen bg-[#000000] font-['Inter'] text-[#FFF8E7]"
      data-language={language}
      data-theme={theme}
    >
      <AppHeader
        adminTitle={adminTitles[adminSection]}
        currentView={currentView}
        isAuthenticated={adminSession.isAuthenticated}
        language={language}
        onLogout={adminSession.logout}
        onToggleLanguage={toggleLanguage}
        onOpenView={openView}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      {isAdminAreaRoute &&
      (adminSession.isRestoring || isRedirectingAuthenticatedLogin) ? (
        <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
          <section className="w-full max-w-md rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
              Admin Access
            </p>
            <h1 className="mt-3 text-3xl font-black text-[#FFF8E7]">
              Restoring your session.
            </h1>
          </section>
        </main>
      ) : canShowAdmin ? (
        <AdminPage
          activeSection={adminSection}
          categoriesState={categoriesState}
          onSectionChange={openAdminSection}
          productsState={productsState}
          sizesState={sizesState}
        />
      ) : isAdminResetPasswordRoute ? (
        <ResetPasswordPage
          accessToken={adminSession.accessToken}
          onBackToLogin={() => openView('adminLogin')}
        />
      ) : isAdminAreaRoute ? (
        <LoginPage
          onLogin={handleAdminLogin}
          onOtpLogin={handleAdminOtpLogin}
          onViewStore={() => openView('store')}
        />
      ) : currentView === 'mystore' ? (
        <MyStorePage
          activeProducts={productsState.activeProducts}
          featuredProduct={productsState.featuredProduct}
          language={language}
          onManageProducts={openProductManagement}
          onViewHome={() => openView('store')}
        />
      ) : currentView === 'cart' ? (
        <CartPage
          featuredProduct={productsState.featuredProduct}
          language={language}
          onViewHome={() => openView('store')}
        />
      ) : (
        <StorePage
          activeProducts={productsState.activeProducts}
          language={language}
          onManageProducts={openProductManagement}
        />
      )}
    </div>
  )
}

export default App
