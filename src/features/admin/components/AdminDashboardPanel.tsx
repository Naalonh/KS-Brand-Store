import type { ProductsState } from '../../products/hooks/useProducts'
import { AdminMetric } from './AdminMetric'

type AdminDashboardPanelProps = {
  onOpenProducts: () => void
  productsState: ProductsState
}

export function AdminDashboardPanel({
  onOpenProducts,
  productsState,
}: AdminDashboardPanelProps) {
  const activeCount = productsState.activeProducts.length
  const hiddenCount = productsState.products.length - activeCount
  const featuredProduct = productsState.featuredProduct

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <AdminMetric label="Total Products" value={productsState.products.length} />
        <AdminMetric label="Active Products" value={activeCount} />
        <AdminMetric label="Hidden Products" value={hiddenCount} />
      </section>

      <section className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:rounded-3xl sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
              Store Status
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#FFF8E7] sm:text-3xl">
              Collection overview
            </h2>
            {productsState.error ? (
              <p className="mt-3 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 py-3 text-sm font-semibold text-[#FDD97D]">
                {productsState.error}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onOpenProducts}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-[#E4B45A] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] sm:w-auto sm:px-7 sm:tracking-[0.14em]"
          >
            Manage Products
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="overflow-hidden rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] sm:rounded-3xl">
          <img
            src={featuredProduct.image}
            alt={`${featuredProduct.name} featured product`}
            className="h-72 w-full object-cover"
          />
        </div>
        <div className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 sm:rounded-3xl sm:p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
            Featured Pair
          </p>
          <h3 className="mt-2 text-2xl font-black text-[#FFF8E7] sm:text-3xl">
            {featuredProduct.name}
          </h3>
          <p className="mt-3 text-[#B8A98A]">{featuredProduct.tag}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-[#9C7A42]/45 px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[#E4B45A]">
              {featuredProduct.price}
            </span>
            <span className="rounded-full border border-[#9C7A42]/45 px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[#B8A98A]">
              {featuredProduct.sizes}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
