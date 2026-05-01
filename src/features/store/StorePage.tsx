import { Footer } from '../../shared/layout/Footer'
import type { Product } from '../products/types'
import { highlights } from './data/highlights'
import { ProductCard } from './components/ProductCard'

type StorePageProps = {
  activeProducts: Product[]
  featuredProduct: Product
  onManageProducts: () => void
}

export function StorePage({
  activeProducts,
  featuredProduct,
  onManageProducts,
}: StorePageProps) {
  return (
    <>
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-[#9C7A42]/60 bg-[#130E0D] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#E4B45A]">
              Premium black and gold footwear
            </p>
            <h1 className="text-5xl font-black leading-[1.02] text-[#FFF8E7] sm:text-6xl lg:text-7xl">
              Luxury shoes with a sharper presence.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#B8A98A]">
              KS Brand Store curates polished sneakers and refined casual pairs
              for customers who want quiet detail, rich texture, and confident
              everyday style.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://m.me/ksbrandstore"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#E4B45A] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#000000] shadow-[0_0_40px_rgba(228,180,90,0.22)] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
              >
                Order on Messenger
              </a>
              <a
                href="#products"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#9C7A42]/70 bg-[#130E0D] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#FFF8E7] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
              >
                View Collection
              </a>
            </div>

            <div className="mt-10 grid gap-3 text-sm font-semibold text-[#B8A98A] sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[#9C7A42]/30 bg-[#130E0D] px-4 py-4"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#9C7A42]/40 bg-[#130E0D] shadow-[0_30px_90px_rgba(0,0,0,0.75)]">
            <img
              src={featuredProduct.image}
              alt={`${featuredProduct.name} from KS Brand Store`}
              className="h-[28rem] w-full object-cover brightness-75 contrast-125 grayscale sepia sm:h-[34rem] lg:h-[38rem]"
            />
            <div className="absolute inset-0 bg-[#000000]/20"></div>
            <div className="absolute inset-x-6 top-6 flex items-center justify-between border-b border-[#E4B45A]/30 pb-4 text-xs font-black uppercase tracking-[0.24em] text-[#FDD97D]">
              <span>Signature Drop</span>
              <span>{activeProducts.length} Active</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-[#E4B45A]/30 bg-[#000000]/80 p-5 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#B8A98A]">
                Featured pair
              </p>
              <div className="mt-1 flex items-end justify-between gap-4">
                <p className="text-2xl font-black text-[#FFF8E7]">
                  {featuredProduct.name}
                </p>
                <p className="text-xl font-black text-[#E4B45A]">
                  {featuredProduct.price}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="new" className="border-y border-[#9C7A42]/25 bg-[#130E0D]">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
            <div>
              <p className="text-sm font-black text-[#E4B45A]">01</p>
              <h2 className="mt-2 text-xl font-black text-[#FFF8E7]">
                Curated materials
              </h2>
              <p className="mt-2 text-[#B8A98A]">
                Rich textures, clean shapes, and refined finishes selected for
                a premium wardrobe.
              </p>
            </div>
            <div>
              <p className="text-sm font-black text-[#E4B45A]">02</p>
              <h2 className="mt-2 text-xl font-black text-[#FFF8E7]">
                Modern silhouettes
              </h2>
              <p className="mt-2 text-[#B8A98A]">
                Minimal profiles designed to pair with smart casual and street
                fashion looks.
              </p>
            </div>
            <div>
              <p className="text-sm font-black text-[#E4B45A]">03</p>
              <h2 className="mt-2 text-xl font-black text-[#FFF8E7]">
                Direct concierge
              </h2>
              <p className="mt-2 text-[#B8A98A]">
                Message us on Facebook with your preferred pair and size for a
                quick order.
              </p>
            </div>
          </div>
        </section>

        <section
          id="products"
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
                Product Preview
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#FFF8E7] sm:text-4xl">
                The gold standard edit
              </h2>
            </div>
            <button
              type="button"
              onClick={onManageProducts}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#E4B45A]/70 bg-[#130E0D] px-5 text-sm font-black uppercase tracking-[0.14em] text-[#E4B45A] transition hover:bg-[#E4B45A] hover:text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
            >
              Manage Products
            </button>
          </div>

          {activeProducts.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-8 text-center">
              <p className="text-lg font-black text-[#FFF8E7]">
                No active products
              </p>
              <p className="mt-2 text-[#B8A98A]">
                Add or activate a product from the admin panel.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
