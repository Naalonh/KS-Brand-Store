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
import {
  createCartItem,
  loadCartItems,
  saveCartItems,
  type CartItem,
} from './features/cart/cartStorage'
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
const PENDING_ADMIN_PATH_KEY = 'ks-brand-store-pending-admin-path'

const getSavedTheme = (): Theme => {
  const savedTheme = window.localStorage.getItem(THEME_KEY)

  return savedTheme === 'light' ? 'light' : 'dark'
}

const getSavedLanguage = (): Language => {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_KEY)

  return savedLanguage === 'km' ? 'km' : 'en'
}

type LoadingPageProps = {
  label?: string
}

function LoadingPage({ label = 'Loading...' }: LoadingPageProps) {
  return (
    <main className="grid min-h-[calc(100vh-5rem)] place-items-center px-4 py-16">
      <section className="grid justify-items-center">
        <div className="relative grid h-24 w-24 place-items-center">
          <div className="ks-logo-spinner absolute inset-0 rounded-full" />
          <img
            src="/logo.png"
            alt="KS Brand Store logo"
            className="relative z-10 h-16 w-16 rounded-full object-contain shadow-[0_0_30px_rgba(228,180,90,0.22)]"
          />
        </div>
        <p className="mt-5 text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
          {label}
        </p>
      </section>
    </main>
  )
}

function App() {
  const { currentPath, currentView, openPath, openView } = usePathView()
  const [theme, setTheme] = useState<Theme>(getSavedTheme)
  const [language, setLanguage] = useState<Language>(getSavedLanguage)
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCartItems)
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
  const isStoreDataLoading =
    currentView === 'store' &&
    (productsState.isLoading || categoriesState.isLoading)
  const isAdminDataLoading =
    canShowAdmin &&
    (productsState.isLoading ||
      categoriesState.isLoading ||
      sizesState.isLoading)

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
      window.sessionStorage.setItem(
        PENDING_ADMIN_PATH_KEY,
        `${window.location.pathname}${window.location.search}`,
      )
      openView('adminLogin', { replace: true })
    }

    if (isAdminLoginRoute && adminSession.isAuthenticated) {
      const pendingAdminPath = window.sessionStorage.getItem(
        PENDING_ADMIN_PATH_KEY,
      )

      if (pendingAdminPath) {
        const pendingAdminUrl = new URL(
          pendingAdminPath,
          window.location.origin,
        )

        window.sessionStorage.removeItem(PENDING_ADMIN_PATH_KEY)
        openPath(pendingAdminUrl.pathname, { replace: true })
        window.history.replaceState(
          null,
          '',
          `${pendingAdminUrl.pathname}${pendingAdminUrl.search}`,
        )
        return
      }

      openAdminSection(adminSection, { replace: true })
    }
  }, [
    adminSection,
    adminSession.isAuthenticated,
    adminSession.isRestoring,
    isAdminLoginRoute,
    isAdminRoute,
    openAdminSection,
    openPath,
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

  const addProductToCart = (
    product: Parameters<typeof createCartItem>[0],
    quantity: number,
    size: string,
  ) => {
    setCartItems((currentItems) => {
      const nextItem = createCartItem(product, quantity, size)
      const existingItemIndex = currentItems.findIndex(
        (item) =>
          item.productId === nextItem.productId && item.size === nextItem.size,
      )
      const nextItems =
        existingItemIndex >= 0
          ? currentItems.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + nextItem.quantity }
                : item,
            )
          : [...currentItems, nextItem]

      saveCartItems(nextItems)
      return nextItems
    })
  }

  const clearCart = () => {
    setCartItems([])
    saveCartItems([])
  }

  const updateCartItemQuantity = (
    productId: string,
    size: string,
    quantity: number,
  ) => {
    setCartItems((currentItems) => {
      const nextItems = currentItems.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: Math.max(quantity, 1) }
          : item,
      )

      saveCartItems(nextItems)
      return nextItems
    })
  }

  const updateCartItemSize = (
    productId: string,
    currentSize: string,
    nextSize: string,
  ) => {
    const normalizedNextSize = nextSize.trim()

    if (!normalizedNextSize || normalizedNextSize === currentSize) {
      return
    }

    setCartItems((currentItems) => {
      const currentItem = currentItems.find(
        (item) => item.productId === productId && item.size === currentSize,
      )

      if (!currentItem) {
        return currentItems
      }

      const hasMatchingSize = currentItems.some(
        (item) =>
          item.productId === productId && item.size === normalizedNextSize,
      )
      const nextItems = hasMatchingSize
        ? currentItems
            .filter(
              (item) =>
                item.productId !== productId || item.size !== currentSize,
            )
            .map((item) =>
              item.productId === productId &&
              item.size === normalizedNextSize
                ? { ...item, quantity: item.quantity + currentItem.quantity }
                : item,
            )
        : currentItems.map((item) =>
            item.productId === productId && item.size === currentSize
              ? { ...item, size: normalizedNextSize }
              : item,
          )

      saveCartItems(nextItems)
      return nextItems
    })
  }

  const removeCartItem = (productId: string, size: string) => {
    setCartItems((currentItems) => {
      const nextItems = currentItems.filter(
        (item) => item.productId !== productId || item.size !== size,
      )

      saveCartItems(nextItems)
      return nextItems
    })
  }

  const cartQuantity = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  return (
    <div
      className="min-h-screen bg-[#000000] font-['Inter'] text-[#FFF8E7]"
      data-language={language}
      data-theme={theme}
    >
      <AppHeader
        activeAdminSection={adminSection}
        adminTitle={adminTitles[adminSection]}
        cartQuantity={cartQuantity}
        currentView={currentView}
        isAuthenticated={adminSession.isAuthenticated}
        language={language}
        onAdminSectionChange={openAdminSection}
        onLogout={adminSession.logout}
        onToggleLanguage={toggleLanguage}
        onOpenView={openView}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      {isStoreDataLoading ? (
        <LoadingPage />
      ) : isAdminAreaRoute &&
      (adminSession.isRestoring || isRedirectingAuthenticatedLogin) ? (
        <LoadingPage label="Loading admin..." />
      ) : isAdminDataLoading ? (
        <LoadingPage label="Loading admin..." />
      ) : canShowAdmin ? (
        <AdminPage
          accessToken={adminSession.accessToken ?? ''}
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
          cartItems={cartItems}
          onClearCart={clearCart}
          onRemoveItem={removeCartItem}
          onUpdateItemSize={updateCartItemSize}
          onUpdateItemQuantity={updateCartItemQuantity}
          products={productsState.products}
          language={language}
          onViewHome={() => openView('store')}
        />
      ) : (
        <StorePage
          activeProducts={productsState.activeProducts}
          categories={categoriesState.categories}
          language={language}
          onAddToCart={addProductToCart}
          onManageProducts={openProductManagement}
        />
      )}
    </div>
  )
}

export default App
