import { useEffect, useMemo, useRef, useState } from 'react'
import type { CategoriesState } from '../../categories/hooks/useCategories'
import type { ProductsState } from '../../products/hooks/useProducts'
import type { SizesState } from '../../sizes/hooks/useSizes'
import type { Product } from '../../products/types'
import { useToast } from '../../../shared/toast/useToast'
import { AdminSummaryCard, type AdminSummaryIcon } from './AdminSummaryCard'
import { ProductFormPanel } from './ProductFormPanel'
import { ProductInventoryList, type ProductViewMode } from './ProductInventoryList'

type ProductsPanelProps = {
  categoriesState: CategoriesState
  productsState: ProductsState
  sizesState: SizesState
}

const matchesSearch = (product: Product, searchTerm: string) => {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  return [
    product.name,
    product.tag,
    product.sizes,
    product.price,
    product.discountPrice ?? '',
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearch)
}

export function ProductsPanel({
  categoriesState,
  productsState,
  sizesState,
}: ProductsPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ProductViewMode>('list')
  const lastErrorToastRef = useRef('')
  const { showToast } = useToast()

  useEffect(() => {
    if (!productsState.error) {
      lastErrorToastRef.current = ''
      return
    }

    if (lastErrorToastRef.current === productsState.error) {
      return
    }

    lastErrorToastRef.current = productsState.error
    showToast({
      message: productsState.error,
      tone: productsState.error.includes('not ready yet')
        ? 'warning'
        : 'error',
    })
  }, [productsState.error, showToast])

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
  const activeProducts = productsState.products.filter(
    (product) => product.active,
  ).length
  const hiddenProducts = productsState.products.length - activeProducts
  const discountedProducts = productsState.products.filter((product) =>
    product.discountPrice?.trim(),
  ).length
  const productSummaryCards = [
    {
      icon: 'product',
      label: 'Total products',
      value: productsState.products.length,
    },
    {
      icon: 'active',
      label: 'Active',
      value: activeProducts,
    },
    {
      icon: 'hidden',
      label: 'Hidden',
      value: hiddenProducts,
    },
    {
      icon: 'revenue',
      label: 'Discounted',
      value: discountedProducts,
    },
  ] satisfies Array<{
    icon: AdminSummaryIcon
    label: string
    value: number
  }>

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

  const selectCategoryFilter = (category: string) => {
    setCategoryFilter(category)
    setIsCategoryFilterOpen(false)
  }

  const toggleProductStatus = async (productId: string) => {
    const product = productsState.products.find(
      (currentProduct) => currentProduct.id === productId,
    )
    const didUpdate = await productsState.toggleProductStatus(productId)

    if (didUpdate && product) {
      showToast({
        message: product.active
          ? 'Product was hidden successfully.'
          : 'Product was shown successfully.',
        tone: 'success',
      })
    }
  }

  const deleteProduct = async (productId: string) => {
    const didDelete = await productsState.deleteProduct(productId)

    if (didDelete) {
      showToast({
        message: 'Product was deleted successfully.',
        tone: 'success',
      })
    }
  }

  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {productSummaryCards.map((card) => (
          <AdminSummaryCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
          />
        ))}
      </section>

      <section className="py-4 sm:py-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-normal text-[#FFF8E7] sm:text-3xl">
              Product inventory
            </h2>
          </div>
          <button
            type="button"
            onClick={openNewProductModal}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] sm:w-auto sm:px-7 sm:tracking-[0.14em]"
          >
            Add New Product
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(12rem,1fr)_minmax(12rem,1fr)_13rem] md:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-normal uppercase tracking-[0.14em] text-[#B8A98A]">
              Search
            </span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products"
              className="min-h-12 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
            />
          </label>

          <div className="grid gap-2">
            <span className="text-sm font-normal uppercase tracking-[0.14em] text-[#B8A98A]">
              Filter Category
            </span>
            <div
              className="relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsCategoryFilterOpen(false)
                }
              }}
            >
              <button
                type="button"
                onClick={() => setIsCategoryFilterOpen((isOpen) => !isOpen)}
                className="inline-flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-left text-[#FFF8E7] outline-none transition hover:border-[#FDD97D] focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                aria-haspopup="listbox"
                aria-expanded={isCategoryFilterOpen}
              >
                <span className="min-w-0 truncate">
                  {categoryFilter === 'all' ? 'All categories' : categoryFilter}
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className={`h-4 w-4 shrink-0 text-[#E4B45A] transition-transform ${
                    isCategoryFilterOpen ? '' : 'rotate-180'
                  }`}
                >
                  <path
                    d="M4 10L8 6L12 10"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.25"
                  />
                </svg>
              </button>
              {isCategoryFilterOpen ? (
                <div
                  role="listbox"
                  className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={categoryFilter === 'all'}
                    onClick={() => selectCategoryFilter('all')}
                    className={`block min-h-11 w-full cursor-pointer px-4 text-left text-sm font-black transition ${
                      categoryFilter === 'all'
                        ? 'bg-[#E4B45A] text-[#000000]'
                        : 'text-[#B8A98A] hover:bg-[#130E0D] hover:text-[#FDD97D]'
                    }`}
                  >
                    All categories
                  </button>
                  {categoryOptions.map((category) => (
                    <button
                      key={category}
                      type="button"
                      role="option"
                      aria-selected={categoryFilter === category}
                      onClick={() => selectCategoryFilter(category)}
                      className={`block min-h-11 w-full cursor-pointer px-4 text-left text-sm font-black transition ${
                        categoryFilter === category
                          ? 'bg-[#E4B45A] text-[#000000]'
                          : 'text-[#B8A98A] hover:bg-[#130E0D] hover:text-[#FDD97D]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-normal uppercase tracking-[0.14em] text-[#B8A98A]">
              View
            </span>
            <div className="grid min-h-12 grid-cols-2 overflow-hidden rounded-[10px] border border-[#9C7A42]/35 bg-[#000000]">
              {(['grid', 'list'] as ProductViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`cursor-pointer px-4 text-xs font-black uppercase tracking-[0.12em] transition ${
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
        onDelete={deleteProduct}
        onEdit={openEditProductModal}
        onToggleStatus={toggleProductStatus}
        viewMode={viewMode}
      />

      {isProductModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#000000]/75 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
          role="presentation"
          onMouseDown={closeProductModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Product details"
            onMouseDown={(event) => event.stopPropagation()}
            className="max-h-[calc(100vh-1.5rem)] w-full max-w-3xl overflow-y-auto sm:max-h-[calc(100vh-3rem)]"
          >
            <ProductFormPanel
              categoriesState={categoriesState}
              productsState={productsState}
              sizesState={sizesState}
              onCancel={closeProductModal}
              onSubmitted={() => setIsProductModalOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
