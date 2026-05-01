import { Footer } from '../../shared/layout/Footer'
import type { Product } from '../products/types'
import { ProductCard } from './components/ProductCard'

type StorePageProps = {
  activeProducts: Product[]
  language: 'en' | 'km'
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

export function StorePage({
  activeProducts,
  language,
}: StorePageProps) {
  const text = storeText[language]

  return (
    <>
      <main>
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-[#9C7A42]/60 bg-[#130E0D] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#E4B45A]">
              {text.eyebrow}
            </p>
            <h1 className="text-4xl font-black leading-[1.05] text-[#FFF8E7] min-[380px]:text-5xl sm:text-6xl lg:text-7xl">
              {text.headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#B8A98A]">
              {text.intro}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://m.me/ksbrandstore"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#E4B45A] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#000000] shadow-[0_0_40px_rgba(228,180,90,0.22)] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
              >
                {text.order}
              </a>
              <a
                href="#products"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#9C7A42]/70 bg-[#130E0D] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#FFF8E7] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
              >
                {text.viewCollection}
              </a>
            </div>
          </div>
        </section>

        <section
          id="products"
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
        >
          {activeProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
              {activeProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  language={language}
                  product={product}
                />
              ))}
            </div>
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

      <Footer language={language} />
    </>
  )
}
