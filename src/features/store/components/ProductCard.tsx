import type { Product } from '../../products/types'

type ProductCardProps = {
  language: 'en' | 'km'
  onAddToCart: (product: Product, quantity: number, size: string) => void
  onSelect: (product: Product) => void
  product: Product
}

const productCardText = {
  en: {
    order: 'Add',
  },
  km: {
    order: 'Add',
  },
}

const getPriceValue = (price: string) => {
  const value = Number(price.replace(/[^0-9.]/g, ''))

  return Number.isFinite(value) ? value : 0
}

const getDiscountLabel = (price: string, discountPrice?: string) => {
  if (!discountPrice?.trim()) {
    return ''
  }

  const originalPrice = getPriceValue(price)
  const salePrice = getPriceValue(discountPrice)

  if (originalPrice <= 0 || salePrice <= 0 || salePrice >= originalPrice) {
    return ''
  }

  return `${Math.round(((originalPrice - salePrice) / originalPrice) * 100)}% OFF`
}

const formatPrice = (price: string) => {
  const trimmedPrice = price.trim()

  if (!trimmedPrice) {
    return ''
  }

  return trimmedPrice.includes('$') ? trimmedPrice : `${trimmedPrice}$`
}

const getProductSizes = (sizes: string) =>
  sizes
    .split(',')
    .map((size) => size.trim())
    .filter(Boolean)

export function ProductCard({
  language,
  onAddToCart,
  onSelect,
  product,
}: ProductCardProps) {
  const text = productCardText[language]
  const discountPrice = product.discountPrice?.trim()
  const badgeLabel = getDiscountLabel(product.price, discountPrice)
  const openProductDetails = () => onSelect(product)
  const addProductToCart = () => {
    onAddToCart(product, 1, getProductSizes(product.sizes)[0] ?? '')
  }

  return (
    <article
      className="cursor-pointer overflow-hidden rounded-[10px] border border-[#9C7A42]/35 bg-[#130E0D] shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-[#E4B45A]/70 focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:rounded-3xl"
      role="button"
      tabIndex={0}
      onClick={openProductDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openProductDetails()
        }
      }}
    >
      <div className="relative">
        <img
          src={product.image}
          alt={`${product.name} shoe`}
          className="h-40 w-full object-cover sm:h-64 lg:h-56 xl:h-64"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#000000]/20"></div>
        {badgeLabel ? (
          <div className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-[#E4B45A]/50 bg-[#000000]/70 px-2 py-1 text-[0.6rem] font-black uppercase tracking-[0.08em] text-[#FDD97D] backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:text-xs sm:tracking-[0.16em]">
            {badgeLabel}
          </div>
        ) : null}
      </div>
      <div className="p-2.5 sm:p-5">
        <h3 className="truncate text-sm font-black text-[#FFF8E7] sm:text-xl">
          {product.name}
        </h3>
        <div className="mt-3 flex items-center justify-between gap-2 sm:mt-5 sm:gap-3">
          <div className="flex min-w-0 items-baseline gap-1.5 sm:gap-2">
            {discountPrice ? (
              <span className="shrink-0 text-xs font-black text-[#B8A98A] line-through decoration-[#FDD97D]/70 sm:text-sm">
                {formatPrice(product.price)}
              </span>
            ) : null}
            <span className="truncate text-sm font-black text-[#E4B45A] sm:text-lg">
              {formatPrice(discountPrice || product.price)}
            </span>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              addProductToCart()
            }}
            className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-[8px] bg-[#E4B45A] px-3 text-center text-[0.65rem] font-black uppercase tracking-[0.08em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] sm:min-h-11 sm:px-7 sm:text-sm sm:tracking-[0.12em]"
          >
            {text.order}
          </button>
        </div>
      </div>
    </article>
  )
}
