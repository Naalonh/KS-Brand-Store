import type { Product } from '../../products/types'

export type ProductViewMode = 'grid' | 'list'

type ProductInventoryListProps = {
  onDelete: (productId: string) => void | Promise<void>
  onEdit: (product: Product) => void
  onToggleStatus: (productId: string) => void | Promise<void>
  products: Product[]
  viewMode: ProductViewMode
}

export function ProductInventoryList({
  onDelete,
  onEdit,
  onToggleStatus,
  products,
  viewMode,
}: ProductInventoryListProps) {
  return (
    <section className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:rounded-3xl sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
            Inventory
          </p>
          <h2 className="mt-2 text-xl font-black text-[#FFF8E7] sm:text-2xl">
            Product List
          </h2>
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
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-[10px] border border-[#9C7A42]/25 bg-[#000000]"
            >
              <img
                src={product.image}
                alt={`${product.name} product`}
                className="h-52 w-full object-cover"
              />
              <div className="grid gap-4 p-4">
                <div>
                  <h3 className="text-xl font-black text-[#FFF8E7]">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[#B8A98A]">
                    {product.tag} / {product.sizes}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-[10px] border border-[#9C7A42]/40 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#E4B45A]">
                    {product.price}
                  </span>
                  <span className="rounded-[10px] border border-[#9C7A42]/40 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A]">
                    {product.active ? 'Active' : 'Hidden'}
                  </span>
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
      ) : (
        <>
          <div className="mt-6 grid gap-3 md:hidden">
            {products.map((product) => (
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
                        {product.price}
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
              {products.map((product) => (
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
                    {product.price}
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
    </section>
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
