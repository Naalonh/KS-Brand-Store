import type { ProductsState } from '../../products/hooks/useProducts'
import { AdminInput } from './AdminInput'
import { ProductImagePicker } from './ProductImagePicker'

type ProductFormPanelProps = {
  onCancel?: () => void
  onSubmitted?: () => void
  productsState: ProductsState
}

export function ProductFormPanel({
  onCancel,
  onSubmitted,
  productsState,
}: ProductFormPanelProps) {
  const handleSubmit: ProductsState['handleSubmit'] = async (event) => {
    const didSubmit = await productsState.handleSubmit(event)

    if (didSubmit) {
      onSubmitted?.()
    }

    return didSubmit
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
            {productsState.editingId ? 'Edit Product' : 'New Product'}
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#FFF8E7]">
            Product Details
          </h2>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-[10px] border border-[#9C7A42]/70 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            Close
          </button>
        ) : productsState.editingId ? (
          <button
            type="button"
            onClick={productsState.resetForm}
            className="cursor-pointer rounded-[10px] border border-[#9C7A42]/70 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4">
        <AdminInput
          label="Name"
          value={productsState.form.name}
          placeholder="Noir Runner"
          onChange={(value) => productsState.updateForm('name', value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput
            label="Price"
            value={productsState.form.price}
            placeholder="$129"
            onChange={(value) => productsState.updateForm('price', value)}
          />
          <AdminInput
            label="Sizes"
            value={productsState.form.sizes}
            placeholder="EU 39-45"
            onChange={(value) => productsState.updateForm('sizes', value)}
          />
        </div>
        <AdminInput
          label="Tag"
          value={productsState.form.tag}
          placeholder="Premium sneaker"
          onChange={(value) => productsState.updateForm('tag', value)}
        />
        <ProductImagePicker
          accessToken={productsState.accessToken}
          imageUrl={productsState.form.image}
          onChange={(value) => productsState.updateForm('image', value)}
        />

        <label className="flex items-center justify-between gap-4 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 py-3">
          <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
            Published
          </span>
          <input
            type="checkbox"
            checked={productsState.form.active}
            onChange={(event) =>
              productsState.updateForm('active', event.target.checked)
            }
            className="h-5 w-5 accent-[#E4B45A]"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
        >
          {productsState.editingId ? 'Save Product' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={productsState.restoreDefaults}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
        >
          Restore
        </button>
      </div>
    </form>
  )
}
