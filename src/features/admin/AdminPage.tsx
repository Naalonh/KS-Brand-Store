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
  activeSection: AdminSection
  categoriesState: CategoriesState
  onSectionChange: (section: AdminSection) => void
  productsState: ProductsState
  sizesState: SizesState
}

export function AdminPage({
  activeSection,
  categoriesState,
  onSectionChange,
  productsState,
  sizesState,
}: AdminPageProps) {
  return (
    <>
      <main className="mt-[15px] w-full px-0 pb-10 pt-0 lg:pl-64">
        <div className="m-[15px] max-w-none">
          <section className="grid gap-6">
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
              <ProductsPanel productsState={productsState} />
            ) : null}

            {activeSection === 'orders' ? (
              <OrdersPanel productsState={productsState} />
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
