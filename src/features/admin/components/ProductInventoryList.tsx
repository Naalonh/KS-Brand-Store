import { useMemo, useState } from 'react'
import type { Product } from '../../products/types'

export type ProductViewMode = 'grid' | 'list'

type ProductInventoryListProps = {
  onDelete: (productId: string) => void | Promise<void>
  onEdit: (product: Product) => void
  onToggleStatus: (productId: string) => void | Promise<void>
  products: Product[]
  viewMode: ProductViewMode
}

const pageSizeOptions = [10, 20, 30, 50]

const formatPrice = (price: string) => {
  const trimmedPrice = price.trim()

  if (!trimmedPrice) {
    return trimmedPrice
  }

  const numericPrice = trimmedPrice.startsWith('$')
    ? trimmedPrice.slice(1).trim()
    : trimmedPrice

  if (/^\d+(?:[,.]\d+)?\$?$/.test(numericPrice)) {
    return `${numericPrice.replace(/\$$/, '')}$`
  }

  return trimmedPrice
}

function ProductPrice({ product }: { product: Product }) {
  const discountPrice = product.discountPrice?.trim()
  const formattedPrice = formatPrice(product.price)

  if (!discountPrice) {
    return <>{formattedPrice}</>
  }

  return (
    <span className="inline-flex flex-wrap items-baseline gap-2">
      <span className="text-[#B8A98A] line-through decoration-[#FDD97D]/70">
        {formattedPrice}
      </span>
      <span className="text-[#E4B45A]">{formatPrice(discountPrice)}</span>
    </span>
  )
}

export function ProductInventoryList({
  onDelete,
  onEdit,
  onToggleStatus,
  products,
  viewMode,
}: ProductInventoryListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false)
  const [pageSize, setPageSize] = useState(pageSizeOptions[0])
  const [viewedProduct, setViewedProduct] = useState<Product | null>(null)
  const totalPages = Math.max(Math.ceil(products.length / pageSize), 1)
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStartIndex = (safeCurrentPage - 1) * pageSize
  const pageEndIndex = Math.min(pageStartIndex + pageSize, products.length)
  const visibleProducts = useMemo(
    () => products.slice(pageStartIndex, pageEndIndex),
    [pageEndIndex, pageStartIndex, products],
  )
  const showingStart = products.length > 0 ? pageStartIndex + 1 : 0

  const changePageSize = (nextPageSize: number) => {
    setPageSize(nextPageSize)
    setCurrentPage(1)
    setIsPageSizeOpen(false)
  }

  return (
    <>
    <section className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:rounded-3xl sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
            Products
          </p>
        </div>
        <span className="text-sm font-semibold text-[#B8A98A]">
          {products.length} shown
        </span>
      </div>

      {products.length === 0 ? (
        <p className="mt-6 rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] px-4 py-8 text-center text-sm font-semibold text-[#B8A98A]">
          No products found.
        </p>
      ) : viewMode === 'grid' ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visibleProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-[10px] border border-[#9C7A42]/25 bg-[#000000]"
            >
              <img
                src={product.image}
                alt={`${product.name} product`}
                className="aspect-square w-full bg-[#07131D] object-contain"
              />
              <div className="grid gap-4 p-4">
                <div className="grid gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 truncate text-lg font-black text-[#FFF8E7]">
                    {product.name}
                    </h3>
                    <span className="shrink-0 text-sm font-black text-[#B8A98A]">
                      {product.tag}
                    </span>
                  </div>
                  <p className="truncate text-sm font-semibold leading-5 text-[#B8A98A]">
                    {product.sizes}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-[10px] border border-[#9C7A42]/40 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#E4B45A]">
                    <ProductPrice product={product} />
                  </span>
                  <span className="rounded-[10px] border border-[#9C7A42]/40 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A]">
                    {product.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewedProduct(product)}
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
                >
                  View
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 md:hidden">
            {visibleProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[10px] border border-[#9C7A42]/25 bg-[#000000]"
              >
                <img
                  src={product.image}
                  alt={`${product.name} product`}
                  className="h-44 w-full object-cover"
                />
                <div className="grid gap-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-black text-[#FFF8E7]">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-[#B8A98A]">
                        {product.tag}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-[10px] border border-[#9C7A42]/40 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#B8A98A]">
                      {product.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-[#B8A98A]">
                    <div className="rounded-[10px] border border-[#9C7A42]/25 p-3">
                      <span className="block text-xs font-black uppercase tracking-[0.12em] text-[#9C7A42]">
                        Sizes
                      </span>
                      <span className="mt-1 block break-words text-[#FFF8E7]">
                        {product.sizes}
                      </span>
                    </div>
                    <div className="rounded-[10px] border border-[#9C7A42]/25 p-3">
                      <span className="block text-xs font-black uppercase tracking-[0.12em] text-[#9C7A42]">
                        Price
                      </span>
                      <span className="mt-1 block font-black text-[#E4B45A]">
                        <ProductPrice product={product} />
                      </span>
                    </div>
                  </div>

                  <ProductActions
                    product={product}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 hidden overflow-x-auto rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] md:block">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#9C7A42]/25 text-xs font-black uppercase tracking-[0.16em] text-[#B8A98A]">
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Sizes</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#9C7A42]/15 last:border-b-0"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={`${product.name} product`}
                        className="h-16 w-16 rounded-[10px] object-cover"
                      />
                      <span className="text-base font-black text-[#FFF8E7]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#B8A98A]">
                    {product.tag}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#B8A98A]">
                    {product.sizes}
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-[#E4B45A]">
                    <ProductPrice product={product} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-[10px] border border-[#9C7A42]/40 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A]">
                      {product.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end">
                      <ProductActions
                        product={product}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onToggleStatus={onToggleStatus}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
      {products.length > 0 ? (
        <div className="mt-6 flex flex-col justify-between gap-4 border-t border-[#9C7A42]/25 pt-4 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm font-semibold text-[#B8A98A]">
              Showing {showingStart} to {pageEndIndex} page {safeCurrentPage}{' '}
              of {totalPages}
            </p>
            <div
              className="relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsPageSizeOpen(false)
                }
              }}
            >
              <button
                type="button"
                onClick={() => setIsPageSizeOpen((isOpen) => !isOpen)}
                className="inline-flex min-h-10 min-w-20 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-xs font-black uppercase tracking-[0.1em] text-[#FFF8E7] outline-none transition hover:border-[#FDD97D] focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                aria-haspopup="listbox"
                aria-expanded={isPageSizeOpen}
              >
                {pageSize}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className={`h-4 w-4 shrink-0 text-[#E4B45A] transition-transform ${
                    isPageSizeOpen ? '' : 'rotate-180'
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
              {isPageSizeOpen ? (
                <div
                  role="listbox"
                  className="absolute bottom-full left-0 z-20 mb-2 w-24 overflow-hidden rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
                >
                  {pageSizeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="option"
                      aria-selected={pageSize === option}
                      onClick={() => changePageSize(option)}
                      className={`block min-h-10 w-full cursor-pointer px-4 text-left text-xs font-black uppercase tracking-[0.1em] transition ${
                        pageSize === option
                          ? 'bg-[#E4B45A] text-[#000000]'
                          : 'text-[#B8A98A] hover:bg-[#130E0D] hover:text-[#FDD97D]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(Math.max(safeCurrentPage - 1, 1))
                }
                disabled={safeCurrentPage === 1}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-4 text-xs font-black uppercase tracking-[0.1em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(Math.min(safeCurrentPage + 1, totalPages))
                }
                disabled={safeCurrentPage === totalPages}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-4 text-xs font-black uppercase tracking-[0.1em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
    {viewedProduct ? (
      <ProductDetailDialog
        onDelete={onDelete}
        onEdit={onEdit}
        onClose={() => setViewedProduct(null)}
        onToggleStatus={onToggleStatus}
        product={viewedProduct}
      />
    ) : null}
    </>
  )
}

type ProductDetailDialogProps = {
  onDelete: (productId: string) => void | Promise<void>
  onEdit: (product: Product) => void
  onClose: () => void
  onToggleStatus: (productId: string) => void | Promise<void>
  product: Product
}

function ProductDetailDialog({
  onClose,
  onDelete,
  onEdit,
  onToggleStatus,
  product,
}: ProductDetailDialogProps) {
  const editProduct = () => {
    onClose()
    onEdit(product)
  }

  const deleteProduct = async () => {
    onClose()
    await onDelete(product.id)
  }

  const toggleProductStatus = async () => {
    onClose()
    await onToggleStatus(product.id)
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-[#000000]/75 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Product Detail"
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[calc(100vh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.8)] sm:max-h-[calc(100vh-3rem)] sm:rounded-3xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
              Product Detail
            </p>
            <h3 className="mt-2 text-2xl font-black text-[#FFF8E7]">
              {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product detail"
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 text-lg font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            X
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
          <img
            src={product.image}
            alt={`${product.name} product`}
            className="aspect-square w-full rounded-[10px] bg-[#07131D] object-contain"
          />
          <div className="grid content-start gap-4 md:border-l md:border-[#9C7A42]/25 md:pl-6">
            <div className="grid gap-1">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9C7A42]">
                Category
              </span>
              <span className="text-base font-black text-[#FFF8E7]">
                {product.tag}
              </span>
            </div>
            <div className="grid gap-1">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9C7A42]">
                Sizes
              </span>
              <span className="break-words text-sm font-semibold leading-6 text-[#B8A98A]">
                {product.sizes}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-[10px] border border-[#9C7A42]/40 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#E4B45A]">
                <ProductPrice product={product} />
              </span>
              <span className="rounded-[10px] border border-[#9C7A42]/40 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A]">
                {product.active ? 'Active' : 'Hidden'}
              </span>
            </div>
            <ProductActions
              product={product}
              onDelete={deleteProduct}
              onEdit={editProduct}
              onToggleStatus={toggleProductStatus}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

type ProductActionsProps = {
  onDelete: (productId: string) => void | Promise<void>
  onEdit: (product: Product) => void
  onToggleStatus: (productId: string) => void | Promise<void>
  product: Product
}

function ProductActions({
  onDelete,
  onEdit,
  onToggleStatus,
  product,
}: ProductActionsProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <button
        type="button"
        onClick={() => onEdit(product)}
        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-3 text-xs font-black uppercase tracking-[0.1em] text-[#E4B45A] transition hover:bg-[#E4B45A] hover:text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:px-4 sm:tracking-[0.12em]"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => onToggleStatus(product.id)}
        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-3 text-xs font-black uppercase tracking-[0.1em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000] sm:px-4 sm:tracking-[0.12em]"
      >
        {product.active ? 'Hide' : 'Show'}
      </button>
      <button
        type="button"
        onClick={() => onDelete(product.id)}
        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-3 text-xs font-black uppercase tracking-[0.1em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000] sm:px-4 sm:tracking-[0.12em]"
      >
        Delete
      </button>
    </div>
  )
}
