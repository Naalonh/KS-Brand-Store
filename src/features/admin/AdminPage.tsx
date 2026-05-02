import type { ProductsState } from '../products/hooks/useProducts'
import type { CategoriesState } from '../categories/hooks/useCategories'
import type { SizesState } from '../sizes/hooks/useSizes'
import type { AdminSection } from './adminSections'
import { AdminDashboardPanel } from './components/AdminDashboardPanel'
import { AdminSidebar } from './components/AdminSidebar'
import { CategoriesPanel } from './components/CategoriesPanel'
import { OrdersPanel } from './components/OrdersPanel'
import { ProductsPanel } from './components/ProductsPanel'
import { SizePanel } from './components/SizePanel'

type AdminPageProps = {
  accessToken: string
  activeSection: AdminSection
  categoriesState: CategoriesState
  onSectionChange: (section: AdminSection) => void
  productsState: ProductsState
  sizesState: SizesState
}

export function AdminPage({
  accessToken,
  activeSection,
  categoriesState,
  onSectionChange,
  productsState,
  sizesState,
}: AdminPageProps) {
  return (
    <>
      <main className="mt-3 w-full px-0 pb-8 pt-0 lg:mt-[15px] lg:pl-64">
        <div className="mx-3 max-w-none sm:mx-[15px]">
          <section className="grid gap-4 sm:gap-6">
            <AdminSidebar
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />

            {activeSection === 'dashboard' ? (
              <AdminDashboardPanel
                productsState={productsState}
                onOpenProducts={() => onSectionChange('products')}
              />
            ) : null}

            {activeSection === 'products' ? (
              <ProductsPanel
                categoriesState={categoriesState}
                productsState={productsState}
                sizesState={sizesState}
              />
            ) : null}

            {activeSection === 'orders' ? (
              <OrdersPanel accessToken={accessToken} />
            ) : null}

            {activeSection === 'categories' ? (
              <CategoriesPanel categoriesState={categoriesState} />
            ) : null}

            {activeSection === 'size' ? (
              <SizePanel sizesState={sizesState} />
            ) : null}
          </section>
        </div>
      </main>

    </>
  )
}
