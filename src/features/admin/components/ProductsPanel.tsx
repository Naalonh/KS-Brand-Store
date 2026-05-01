import { useMemo, useState } from 'react'
import type { ProductsState } from '../../products/hooks/useProducts'
import type { Product } from '../../products/types'
import { ProductFormPanel } from './ProductFormPanel'
import { ProductInventoryList, type ProductViewMode } from './ProductInventoryList'

type ProductsPanelProps = {
  productsState: ProductsState
}

const matchesSearch = (product: Product, searchTerm: string) => {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  return [product.name, product.tag, product.sizes, product.price]
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearch)
}

export function ProductsPanel({ productsState }: ProductsPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ProductViewMode>('list')

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          productsState.products
            .map((product) => product.tag.trim())
            .filter(Boolean),
        ),
      ),
    [productsState.products],
  )

  const filteredProducts = useMemo(
    () =>
      productsState.products.filter(
        (product) =>
          matchesSearch(product, searchTerm) &&
          (categoryFilter === 'all' || product.tag === categoryFilter),
      ),
    [categoryFilter, productsState.products, searchTerm],
  )

  const closeProductModal = () => {
    productsState.resetForm()
    setIsProductModalOpen(false)
  }

  const openNewProductModal = () => {
    productsState.resetForm()
    setIsProductModalOpen(true)
  }

  const openEditProductModal = (product: Product) => {
    productsState.editProduct(product)
    setIsProductModalOpen(true)
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
              Products
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#FFF8E7]">
              Product inventory
            </h2>
          </div>
          <button
            type="button"
            onClick={openNewProductModal}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            Add New Product
          </button>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_16rem_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
              Search
            </span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products"
              className="min-h-12 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
              Filter Category
            </span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="min-h-12 cursor-pointer rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
            >
              <option value="all">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
              View
            </span>
            <div className="grid min-h-12 grid-cols-2 overflow-hidden rounded-[10px] border border-[#9C7A42]/35 bg-[#000000]">
              {(['grid', 'list'] as ProductViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`cursor-pointer px-5 text-xs font-black uppercase tracking-[0.12em] transition ${
                    viewMode === mode
                      ? 'bg-[#E4B45A] text-[#000000]'
                      : 'text-[#B8A98A] hover:text-[#FDD97D]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {productsState.error ? (
          <p className="mt-4 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 py-3 text-sm font-semibold text-[#FDD97D]">
            {productsState.error}
          </p>
        ) : null}
      </section>

      <ProductInventoryList
        products={filteredProducts}
        onDelete={productsState.deleteProduct}
        onEdit={openEditProductModal}
        onToggleStatus={productsState.toggleProductStatus}
        viewMode={viewMode}
      />

      {isProductModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#000000]/75 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={closeProductModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Product details"
            onMouseDown={(event) => event.stopPropagation()}
            className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto"
          >
            <ProductFormPanel
              productsState={productsState}
              onCancel={closeProductModal}
              onSubmitted={() => setIsProductModalOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
