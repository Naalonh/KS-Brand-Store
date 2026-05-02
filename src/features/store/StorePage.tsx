import { useState } from 'react'
import { Footer } from '../../shared/layout/Footer'
import type { Category } from '../categories/types'
import type { Product } from '../products/types'
import { ProductCard } from './components/ProductCard'
import bannerImage from '../../../banner.png'

type StorePageProps = {
  activeProducts: Product[]
  categories: Category[]
  language: 'en' | 'km'
  onAddToCart: (product: Product, quantity: number, size: string) => void
  onManageProducts: () => void
}

const storeText = {
  en: {
    addProducts: 'Add or activate a product from the admin panel.',
    eyebrow: 'Premium black and gold footwear',
    headline: 'Luxury shoes with a sharper presence.',
    intro:
      'KS Brand Store curates polished sneakers and refined casual pairs for customers who want quiet detail, rich texture, and confident everyday style.',
    manageProducts: 'Manage Products',
    noActiveProducts: 'No active products',
    order: 'Order on Messenger',
    productPreview: 'Product Preview',
    productTitle: 'The gold standard edit',
    viewCollection: 'View Collection',
  },
  km: {
    addProducts: 'បន្ថែម ឬបើកផលិតផលពីផ្ទាំងគ្រប់គ្រង។',
    eyebrow: 'ស្បែកជើងពណ៌ខ្មៅ និងមាសលំដាប់ខ្ពស់',
    headline: 'ស្បែកជើងលុច្សស៊ូរីដែលមានរូបរាងលេចធ្លោ។',
    intro:
      'KS Brand Store ជ្រើសរើសស្បែកជើងដែលមានរចនាប័ទ្មស្អាត សាច់សម្ភារៈប្រណីត និងសាកសមសម្រាប់ការប្រើប្រាស់រាល់ថ្ងៃ។',
    manageProducts: 'គ្រប់គ្រងផលិតផល',
    noActiveProducts: 'មិនមានផលិតផលសកម្ម',
    order: 'បញ្ជាទិញតាម Messenger',
    productPreview: 'មើលផលិតផល',
    productTitle: 'ការជ្រើសរើសស្តង់ដារមាស',
    viewCollection: 'មើលការប្រមូល',
  },
}

const formatPrice = (price: string) => {
  const trimmedPrice = price.trim()

  if (!trimmedPrice) {
    return ''
  }

  return trimmedPrice.includes('$') ? trimmedPrice : `${trimmedPrice}$`
}

const getPriceValue = (price: string) => {
  const value = Number(price.replace(/[^0-9.]/g, ''))

  return Number.isFinite(value) ? value : 0
}

const formatTotalPrice = (unitPrice: string, quantity: number) => {
  const value = getPriceValue(unitPrice)

  if (value <= 0) {
    return formatPrice(unitPrice)
  }

  return `${Number((value * quantity).toFixed(2))}$`
}

const getProductSizes = (sizes: string) =>
  sizes
    .split(',')
    .map((size) => size.trim())
    .filter(Boolean)

const productsPerPage = 30
const getPageNumbers = (currentPage: number, totalPages: number) => {
  const startPage = Math.max(Math.min(currentPage - 1, totalPages - 2), 1)
  const endPage = Math.min(startPage + 2, totalPages)

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  )
}

export function StorePage({
  activeProducts,
  categories,
  language,
  onAddToCart,
}: StorePageProps) {
  const text = storeText[language]
  const activeCategories = categories.filter((category) => category.active)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('')
  const filteredProducts =
    selectedCategorySlug === 'all'
      ? activeProducts
      : activeProducts.filter((product) => {
          const category = activeCategories.find(
            (currentCategory) => currentCategory.slug === selectedCategorySlug,
          )
          const categoryName = category?.name.toLowerCase() ?? ''
          const categorySlug = category?.slug.toLowerCase() ?? ''
          const productText = `${product.name} ${product.tag}`.toLowerCase()

          return (
            Boolean(categoryName && productText.includes(categoryName)) ||
            Boolean(categorySlug && productText.includes(categorySlug))
          )
        })
  const totalPages = Math.max(
    Math.ceil(filteredProducts.length / productsPerPage),
    1,
  )
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStartIndex = (safeCurrentPage - 1) * productsPerPage
  const pageEndIndex = Math.min(
    pageStartIndex + productsPerPage,
    filteredProducts.length,
  )
  const pageNumbers = getPageNumbers(safeCurrentPage, totalPages)
  const visibleProducts = filteredProducts.slice(pageStartIndex, pageEndIndex)
  const showingStart = filteredProducts.length > 0 ? pageStartIndex + 1 : 0

  const selectCategory = (categorySlug: string) => {
    setSelectedCategorySlug(categorySlug)
    setCurrentPage(1)
    window.location.hash = 'products'
  }

  const openProductDetails = (product: Product) => {
    const productSizes = getProductSizes(product.sizes)

    setSelectedSize(productSizes[0] ?? '')
    setSelectedQuantity(1)
    setSelectedProduct(product)
  }

  const selectedProductSizes = selectedProduct
    ? getProductSizes(selectedProduct.sizes)
    : []
  const selectedProductUnitPrice =
    selectedProduct?.discountPrice?.trim() || selectedProduct?.price || ''
  const addSelectedProductToCart = () => {
    if (!selectedProduct) {
      return
    }

    onAddToCart(selectedProduct, selectedQuantity, selectedSize)
    setSelectedProduct(null)
  }

  return (
    <>
      <main>
        <div className="sticky top-20 z-10 border-b border-[#9C7A42]/25 bg-[#000000]/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => selectCategory('all')}
              className={`relative inline-flex min-h-10 shrink-0 items-center justify-center px-1 text-xs font-black uppercase tracking-[0.12em] transition duration-200 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:origin-left after:rounded-full after:transition-transform after:duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDD97D] ${
                selectedCategorySlug === 'all'
                  ? 'text-[#E4B45A] after:scale-x-100 after:bg-[#E4B45A]'
                  : 'text-[#B8A98A] after:scale-x-0 after:bg-[#E4B45A] hover:text-[#FDD97D] hover:after:scale-x-100'
              }`}
            >
              All
            </button>
            {activeCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.slug)}
                className={`relative inline-flex min-h-10 shrink-0 items-center justify-center px-1 text-xs font-black uppercase tracking-[0.12em] transition duration-200 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:origin-left after:rounded-full after:transition-transform after:duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDD97D] ${
                  selectedCategorySlug === category.slug
                    ? 'text-[#E4B45A] after:scale-x-100 after:bg-[#E4B45A]'
                    : 'text-[#B8A98A] after:scale-x-0 after:bg-[#E4B45A] hover:text-[#FDD97D] hover:after:scale-x-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <section className="w-full px-0 pb-6 pt-0 xl:mx-auto xl:max-w-7xl xl:px-8">
          <img
            src={bannerImage}
            alt="KS Brand Store banner"
            className="block w-full object-cover"
          />
        </section>

        <section
          id="products"
          className="mx-auto max-w-7xl px-4 pb-14 pt-4 sm:px-6 sm:pb-16 sm:pt-5 lg:px-8"
        >
          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    language={language}
                    onSelect={openProductDetails}
                    product={product}
                  />
                ))}
              </div>
              {filteredProducts.length > productsPerPage ? (
                <div className="mt-8 flex flex-col items-stretch justify-between gap-3 border-t border-[#9C7A42]/25 pt-5 sm:flex-row sm:items-center">
                  <p className="text-sm font-semibold text-[#B8A98A]">
                    Showing {showingStart} to {pageEndIndex} of{' '}
                    {filteredProducts.length}
                  </p>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:flex sm:items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(Math.max(safeCurrentPage - 1, 1))
                      }
                      disabled={safeCurrentPage === 1}
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Previous
                    </button>
                    <div className="flex items-center justify-center gap-1">
                      {pageNumbers.map((pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setCurrentPage(pageNumber)}
                          aria-current={
                            pageNumber === safeCurrentPage ? 'page' : undefined
                          }
                          className={`inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-[10px] border px-3 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000] ${
                            pageNumber === safeCurrentPage
                              ? 'border-[#E4B45A] bg-[#E4B45A] text-[#000000]'
                              : 'border-[#9C7A42]/70 text-[#B8A98A] hover:border-[#FDD97D] hover:text-[#FDD97D]'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          Math.min(safeCurrentPage + 1, totalPages),
                        )
                      }
                      disabled={safeCurrentPage === totalPages}
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-8 rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-8 text-center">
              <p className="text-lg font-black text-[#FFF8E7]">
                {text.noActiveProducts}
              </p>
              <p className="mt-2 text-[#B8A98A]">
                {text.addProducts}
              </p>
            </div>
          )}
        </section>
      </main>

      {selectedProduct ? (
        <div
          className="fixed inset-0 z-[100] flex items-stretch justify-stretch bg-[#000000]/75 p-0 sm:items-center sm:justify-center sm:p-4"
          onMouseDown={() => setSelectedProduct(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="store-product-details-title"
            className="h-full max-h-screen w-full overflow-y-auto border border-[#9C7A42]/45 bg-[#130E0D] shadow-[0_24px_80px_rgba(0,0,0,0.65)] sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:max-w-4xl sm:rounded-[8px]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="hidden items-center justify-between border-b border-[#9C7A42]/30 px-5 py-4 sm:flex">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#E4B45A]">
                Product Detail
              </p>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E4B45A]/50 bg-[#000000] text-lg font-bold text-[#FDD97D] transition hover:bg-[#2A0F0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDD97D]"
                aria-label="Close product detail"
              >
                X
              </button>
            </div>

            <div className="grid md:grid-cols-[minmax(0,0.95fr)_minmax(18rem,1.05fr)]">
              <div className="relative bg-[#000000] p-0 sm:p-[10px]">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="absolute left-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#E4B45A]/45 bg-[#000000]/70 text-[#FDD97D] backdrop-blur transition hover:bg-[#2A0F0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDD97D] sm:hidden"
                  aria-label="Back to products"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 12H5" />
                    <path d="m12 19-7-7 7-7" />
                  </svg>
                </button>
                <img
                  src={selectedProduct.image}
                  alt={`${selectedProduct.name} shoe`}
                  className="max-h-[62vh] w-full object-contain md:h-full md:min-h-[24rem]"
                />
              </div>

              <div className="flex flex-col p-5 md:border-l md:border-[#9C7A42]/30 md:p-6">
                <h2
                  id="store-product-details-title"
                  className="text-2xl font-bold text-[#FFF8E7]"
                >
                  {selectedProduct.name}
                </h2>
                <div className="mt-4 flex items-baseline gap-3">
                  {selectedProduct.discountPrice?.trim() ? (
                    <span className="text-base font-normal text-[#B8A98A] line-through decoration-[#FDD97D]/70">
                      {formatPrice(selectedProduct.price)}
                    </span>
                  ) : null}
                  <span className="text-2xl font-bold text-[#E4B45A]">
                    {formatPrice(
                      selectedProduct.discountPrice?.trim() || selectedProduct.price,
                    )}
                  </span>
                </div>
                {selectedProductSizes.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-sm font-normal text-[#B8A98A]">
                      Sizes
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                      {selectedProductSizes.map((size) => {
                        const isSelected = selectedSize === size

                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`min-h-9 min-w-0 truncate whitespace-nowrap rounded-[8px] border px-2 text-[0.7rem] font-bold transition focus:outline-none focus:ring-2 focus:ring-[#FDD97D] sm:px-3 sm:text-xs ${
                              isSelected
                                ? 'border-[#E4B45A] bg-[#E4B45A] text-[#000000]'
                                : 'border-[#9C7A42]/45 bg-[#000000] text-[#FFF8E7] hover:border-[#E4B45A] hover:text-[#FDD97D]'
                            }`}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
                <div className="sticky bottom-0 z-10 -mx-5 mt-6 bg-[#130E0D] p-5 md:static md:mx-0 md:mt-auto md:rounded-[8px] md:bg-[#000000] md:p-4">
                  <p className="text-xs font-normal text-[#B8A98A]">
                    Quantity
                  </p>
                  <div className="mt-2 grid grid-cols-[7.25rem_minmax(0,1fr)] gap-3">
                    <div className="flex min-h-10 overflow-hidden rounded-[8px] border border-[#9C7A42]/35 bg-[#130E0D]">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedQuantity((currentQuantity) =>
                            Math.max(currentQuantity - 1, 1),
                          )
                        }
                        className="flex w-10 items-center justify-center text-lg font-bold text-[#B8A98A] transition hover:bg-[#2A0F0A] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FDD97D]"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="flex min-w-0 flex-1 items-center justify-center border-x border-[#9C7A42]/25 text-base font-bold text-[#FFF8E7]">
                        {selectedQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedQuantity((currentQuantity) =>
                            currentQuantity + 1,
                          )
                        }
                        className="flex w-10 items-center justify-center text-lg font-bold text-[#B8A98A] transition hover:bg-[#2A0F0A] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FDD97D]"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={addSelectedProductToCart}
                      className="inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-[8px] bg-[#E4B45A] px-3 text-xs font-bold text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:gap-2 sm:px-5 sm:text-sm"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.1 2.1h3l2.7 12.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6l1.3-6.9H6.2" />
                      </svg>
                      Add to Cart ·{' '}
                      {formatTotalPrice(
                        selectedProductUnitPrice,
                        selectedQuantity,
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Footer language={language} />
    </>
  )
}
