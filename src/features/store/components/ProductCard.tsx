import type { Product } from '../../products/types'

type ProductCardProps = {
  language: 'en' | 'km'
  product: Product
}

const productCardText = {
  en: {
    order: 'Order on Facebook',
    sizes: 'Sizes',
  },
  km: {
    order: 'បញ្ជាទិញតាម Facebook',
    sizes: 'ទំហំ',
  },
}

export function ProductCard({ language, product }: ProductCardProps) {
  const text = productCardText[language]

  return (
    <article className="overflow-hidden rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-[#E4B45A]/70 sm:rounded-3xl">
      <div className="relative">
        <img
          src={product.image}
          alt={`${product.name} shoe`}
          className="h-40 w-full object-cover brightness-75 contrast-125 grayscale sepia sm:h-64 lg:h-56 xl:h-64"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#000000]/20"></div>
        <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-[#E4B45A]/50 bg-[#000000]/70 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[#FDD97D] backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:text-xs sm:tracking-[0.16em]">
          {product.tag}
        </div>
      </div>
      <div className="p-3 sm:p-5">
        <div className="grid gap-2 sm:flex sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-[#FFF8E7] sm:text-xl">
              {product.name}
            </h3>
            <p className="mt-1 text-xs font-semibold text-[#B8A98A] sm:mt-2 sm:text-sm">
              {text.sizes}: {product.sizes}
            </p>
          </div>
          <p className="text-base font-black text-[#E4B45A] sm:text-lg">
            {product.price}
          </p>
        </div>
        <a
          href="https://m.me/ksbrandstore"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-[#E4B45A] px-3 text-center text-[0.65rem] font-black uppercase tracking-[0.08em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] sm:mt-5 sm:min-h-11 sm:px-5 sm:text-sm sm:tracking-[0.12em]"
        >
          {text.order}
        </a>
      </div>
    </article>
  )
}
