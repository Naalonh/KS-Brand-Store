import { Footer } from '../../shared/layout/Footer'
import type { Product } from '../products/types'

type CartPageProps = {
  featuredProduct: Product
  language: 'en' | 'km'
  onViewHome: () => void
}

export function CartPage({
  featuredProduct,
  language,
  onViewHome,
}: CartPageProps) {
  return (
    <>
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:items-start lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
              Order Cart
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[#FFF8E7] sm:text-5xl">
              Your selected pair is ready.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#B8A98A]">
              Review the current featured item, then open Messenger to confirm
              size, availability, delivery details, and payment with the store.
            </p>

            <div className="mt-8 overflow-hidden rounded-3xl border border-[#9C7A42]/40 bg-[#130E0D] shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              <img
                src={featuredProduct.image}
                alt={`${featuredProduct.name} selected shoe`}
                className="h-80 w-full object-cover"
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8A98A]">
                      Selected Item
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-[#FFF8E7]">
                      {featuredProduct.name}
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-[#B8A98A]">
                      Sizes: {featuredProduct.sizes}
                    </p>
                  </div>
                  <p className="text-xl font-black text-[#E4B45A]">
                    {featuredProduct.price}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-[#9C7A42]/40 bg-[#130E0D] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
              Cart Summary
            </p>

            <div className="mt-6 grid gap-4 text-sm font-semibold text-[#B8A98A]">
              <div className="flex items-center justify-between gap-4 border-b border-[#9C7A42]/30 pb-4">
                <span>Item</span>
                <span className="text-right text-[#FFF8E7]">
                  {featuredProduct.name}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#9C7A42]/30 pb-4">
                <span>Quantity</span>
                <span className="text-[#FFF8E7]">1</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#9C7A42]/30 pb-4">
                <span>Size</span>
                <span className="text-right text-[#FFF8E7]">
                  Confirm in Messenger
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-base">
                <span>Total</span>
                <span className="text-xl font-black text-[#E4B45A]">
                  {featuredProduct.price}
                </span>
              </div>
            </div>

            <a
              href="https://m.me/ksbrandstore"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#E4B45A] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
            >
              Open Messenger
            </a>
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
