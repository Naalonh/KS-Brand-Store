import { Footer } from '../../shared/layout/Footer'
import type { CartItem } from './cartStorage'

type CartPageProps = {
  cartItems: CartItem[]
  language: 'en' | 'km'
  onClearCart: () => void
  onViewHome: () => void
}

const getPriceValue = (price: string) => {
  const value = Number(price.replace(/[^0-9.]/g, ''))

  return Number.isFinite(value) ? value : 0
}

const formatTotalPrice = (value: number) => `${Number(value.toFixed(2))}$`

const buildOrderMessage = (items: CartItem[], total: number) => {
  if (items.length === 0) {
    return 'Hello Bong, This is my order\n\nTotal : 0$'
  }

  const productLines = items
    .map((item, index) => {
      const itemTotal = getPriceValue(item.price) * item.quantity

      return [
        `Product ${index + 1}`,
        `Product image : ${item.image}`,
        `product name : ${item.name}`,
        `size : ${item.size || 'Confirm in chat'}`,
        `qty : ${item.quantity}`,
        `price : ${formatTotalPrice(itemTotal)}`,
      ].join('\n')
    })
    .join('\n\n')

  return `Hello Bong, This is my order\n${productLines}\n\nTotal : ${formatTotalPrice(total)}`
}

export function CartPage({
  cartItems,
  language,
  onClearCart,
  onViewHome,
}: CartPageProps) {
  const items = cartItems.length > 0 ? cartItems : []
  const total = items.reduce(
    (sum, item) => sum + getPriceValue(item.price) * item.quantity,
    0,
  )
  const orderMessage = buildOrderMessage(items, total)
  const encodedOrderMessage = encodeURIComponent(orderMessage)

  return (
    <>
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-start lg:px-8 lg:py-20">
          <div>
            <div className="grid gap-4">
              {items.length > 0 ? (
                items.map((item) => (
                  <article
                    key={`${item.productId}-${item.size}`}
                    className="grid overflow-hidden rounded-[10px] border border-[#9C7A42]/40 bg-[#130E0D] shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:grid-cols-[10rem_1fr]"
                  >
                    <img
                      src={item.image}
                      alt={`${item.name} selected shoe`}
                      className="aspect-square w-full bg-[#000000] object-cover"
                    />
                    <div className="grid gap-4 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8A98A]">
                            Selected Item
                          </p>
                          <h2 className="mt-1 text-2xl font-black text-[#FFF8E7]">
                            {item.name}
                          </h2>
                        </div>
                        <p className="text-xl font-black text-[#E4B45A]">
                          {formatTotalPrice(
                            getPriceValue(item.price) * item.quantity,
                          )}
                        </p>
                      </div>
                      <div className="grid gap-2 text-sm font-semibold text-[#B8A98A] sm:grid-cols-2">
                        <p>Size: {item.size || 'Confirm in Messenger'}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <article className="flex min-h-[23rem] flex-col items-center justify-center overflow-hidden rounded-[10px] border border-[#9C7A42]/40 bg-[#130E0D] p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                  <h2 className="text-2xl font-black text-[#FFF8E7]">
                    Your cart is empty.
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-[#B8A98A]">
                    Add a product from the collection first.
                  </p>
                </article>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-[#9C7A42]/40 bg-[#130E0D] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
              Cart Summary
            </p>

            <div className="mt-6 grid gap-4 text-sm font-semibold text-[#B8A98A]">
              <div className="flex items-center justify-between gap-4 border-b border-[#9C7A42]/30 pb-4">
                <span>Items</span>
                <span className="text-right text-[#FFF8E7]">
                  {items.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#9C7A42]/30 pb-4">
                <span>Quantity</span>
                <span className="text-[#FFF8E7]">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-base">
                <span>Total</span>
                <span className="text-xl font-black text-[#E4B45A]">
                  {formatTotalPrice(total)}
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <a
                href={`https://www.facebook.com/messages/t/2210332655694438?text=${encodedOrderMessage}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#E4B45A] px-4 text-center text-sm font-black uppercase tracking-[0.1em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                Messenger
              </a>
              <a
                href={`https://t.me/ksbrandstore84?text=${encodedOrderMessage}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#E4B45A] px-4 text-center text-sm font-black uppercase tracking-[0.1em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                Telegram
              </a>
            </div>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={onClearCart}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#9C7A42]/70 bg-[#130E0D] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
              >
                Clear Cart
              </button>
            ) : null}
            <button
              type="button"
              onClick={onViewHome}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#9C7A42]/70 bg-[#130E0D] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#FFF8E7] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
            >
              Continue Browsing
            </button>
          </aside>
        </section>
      </main>

      <Footer language={language} />
    </>
  )
}
