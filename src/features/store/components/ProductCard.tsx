import type { Product } from '../../products/types'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-[#E4B45A]/70">
      <div className="relative">
        <img
          src={product.image}
          alt={`${product.name} shoe`}
          className="h-72 w-full object-cover brightness-75 contrast-125 grayscale sepia"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#000000]/20"></div>
        <div className="absolute left-4 top-4 rounded-full border border-[#E4B45A]/50 bg-[#000000]/70 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#FDD97D] backdrop-blur">
          {product.tag}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-[#FFF8E7]">
              {product.name}
            </h3>
            <p className="mt-2 text-sm font-semibold text-[#B8A98A]">
              Sizes: {product.sizes}
            </p>
          </div>
          <p className="text-lg font-black text-[#E4B45A]">{product.price}</p>
        </div>
        <a
          href="https://m.me/ksbrandstore"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#E4B45A] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
        >
          Order on Facebook
        </a>
      </div>
    </article>
  )
}
