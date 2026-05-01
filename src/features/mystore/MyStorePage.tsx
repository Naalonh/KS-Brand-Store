import { Footer } from '../../shared/layout/Footer'
import type { Product } from '../products/types'

type MyStorePageProps = {
  activeProducts: Product[]
  featuredProduct: Product
  language: 'en' | 'km'
  onManageProducts: () => void
  onViewHome: () => void
}

export function MyStorePage({
  activeProducts,
  featuredProduct,
  language,
  onManageProducts,
  onViewHome,
}: MyStorePageProps) {
  const previewProducts = activeProducts.slice(0, 3)

  return (
    <>
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
              My Store
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[#FFF8E7] sm:text-5xl">
              KS Brand Store catalog dashboard.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#B8A98A]">
              A quick view of the active collection, featured pair, and store
              ordering flow for customers browsing premium footwear.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-5">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#E4B45A]">
                  Active Pairs
                </p>
                <p className="mt-2 text-3xl font-black text-[#FFF8E7]">
                  {activeProducts.length}
                </p>
              </div>
              <div className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-5">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#E4B45A]">
                  Featured
                </p>
                <p className="mt-2 text-xl font-black text-[#FFF8E7]">
                  {featuredProduct.name}
                </p>
              </div>
              <div className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-5">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#E4B45A]">
                  Ordering
                </p>
                <p className="mt-2 text-lg font-black text-[#FFF8E7]">
                  Messenger
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onViewHome}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#E4B45A] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
              >
                View Storefront
              </button>
              <button
                type="button"
                onClick={onManageProducts}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#9C7A42]/70 bg-[#130E0D] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#FFF8E7] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
              >
                Manage Products
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="overflow-hidden rounded-3xl border border-[#9C7A42]/40 bg-[#130E0D] shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              <img
                src={featuredProduct.image}
                alt={`${featuredProduct.name} featured shoe`}
                className="h-80 w-full object-cover"
              />
              <div className="flex items-end justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8A98A]">
                    Featured Pair
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#FFF8E7]">
                    {featuredProduct.name}
                  </h2>
                </div>
                <p className="text-xl font-black text-[#E4B45A]">
                  {featuredProduct.price}
                </p>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-3">
              {previewProducts.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D]"
                >
                  <img
                    src={product.image}
                    alt={`${product.name} shoe`}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <p className="text-sm font-black text-[#FFF8E7]">
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm font-black text-[#E4B45A]">
                      {product.price}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer language={language} />
    </>
  )
}
