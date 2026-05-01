import { useEffect, useState } from 'react'
import { AdminPage } from './features/admin/AdminPage'
import type { AdminSection } from './features/admin/components/AdminSidebar'
import { LoginPage } from './features/auth/components/LoginPage'
import { useAdminSession } from './features/auth/hooks/useAdminSession'
import { useProducts } from './features/products/hooks/useProducts'
import { StorePage } from './features/store/StorePage'
import { usePathView } from './hooks/usePathView'
import { AppHeader } from './shared/layout/AppHeader'

const adminTitles: Record<AdminSection, string> = {
  categories: 'Dashboard / Categories',
  dashboard: 'Dashboard',
  products: 'Dashboard / Products',
  size: 'Dashboard / Size',
}

function App() {
  const { currentView, openView } = usePathView()
  const [adminSection, setAdminSection] =
    useState<AdminSection>('dashboard')
  const adminSession = useAdminSession()
  const productsState = useProducts(adminSession.accessToken)

  const isAdminRoute = currentView === 'admin'
  const isAdminLoginRoute = currentView === 'adminLogin'
  const isAdminAreaRoute = isAdminRoute || isAdminLoginRoute
  const canShowAdmin = isAdminRoute && adminSession.isAuthenticated
  const isRedirectingAuthenticatedLogin =
    isAdminLoginRoute && adminSession.isAuthenticated

  useEffect(() => {
    if (adminSession.isRestoring) {
      return
    }

    if (isAdminRoute && !adminSession.isAuthenticated) {
      openView('adminLogin', { replace: true })
    }

    if (isAdminLoginRoute && adminSession.isAuthenticated) {
      openView('admin', { replace: true })
    }
  }, [
    adminSession.isAuthenticated,
    adminSession.isRestoring,
    isAdminLoginRoute,
    isAdminRoute,
    openView,
  ])

  const handleAdminLogin = async (email: string, password: string) => {
    const isLoggedIn = await adminSession.login(email, password)
    openView('admin')
    return isLoggedIn
  }

  return (
    <div className="min-h-screen bg-[#000000] font-['Inter'] text-[#FFF8E7]">
      <AppHeader
        adminTitle={adminTitles[adminSection]}
        currentView={currentView}
        isAuthenticated={adminSession.isAuthenticated}
        onLogout={adminSession.logout}
        onOpenView={openView}
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
          onSectionChange={setAdminSection}
          productsState={productsState}
        />
      ) : isAdminAreaRoute ? (
        <LoginPage
          onLogin={handleAdminLogin}
          onViewStore={() => openView('store')}
        />
      ) : (
        <StorePage
          activeProducts={productsState.activeProducts}
          featuredProduct={productsState.featuredProduct}
          onManageProducts={() =>
            openView(adminSession.isAuthenticated ? 'admin' : 'adminLogin')
          }
        />
      )}
    </div>
  )
}

export default App
