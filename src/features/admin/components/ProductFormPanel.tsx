import { useMemo, useState } from 'react'
import type { CategoriesState } from '../../categories/hooks/useCategories'
import type { ProductsState } from '../../products/hooks/useProducts'
import type { SizesState } from '../../sizes/hooks/useSizes'
import { useToast } from '../../../shared/toast/useToast'
import { AdminInput } from './AdminInput'
import { ProductImagePicker } from './ProductImagePicker'

type ProductFormPanelProps = {
  categoriesState: CategoriesState
  onCancel?: () => void
  onSubmitted?: () => void
  productsState: ProductsState
  sizesState: SizesState
}

const getSelectedSizes = (sizes: string) =>
  sizes
    .split(',')
    .map((size) => size.trim())
    .filter(Boolean)

const maxSelectedSizes = 20
const maxProductSizesLength = 512

const formatSelectedSizes = (sizes: string[]) => sizes.join(', ')

const canAddSize = (selectedSizes: string[], sizeName: string) =>
  selectedSizes.length < maxSelectedSizes &&
  formatSelectedSizes([...selectedSizes, sizeName]).length <=
    maxProductSizesLength

export function ProductFormPanel({
  categoriesState,
  onCancel,
  onSubmitted,
  productsState,
  sizesState,
}: ProductFormPanelProps) {
  const [isDiscountEnabled, setIsDiscountEnabled] = useState(() =>
    Boolean(productsState.form.discountPrice),
  )
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false)
  const [isSizePickerOpen, setIsSizePickerOpen] = useState(false)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const { showToast } = useToast()
  const activeSizes = useMemo(
    () => sizesState.sizes.filter((size) => size.active),
    [sizesState.sizes],
  )
  const activeCategories = useMemo(
    () => categoriesState.categories.filter((category) => category.active),
    [categoriesState.categories],
  )
  const selectedSizes = useMemo(
    () => getSelectedSizes(productsState.form.sizes),
    [productsState.form.sizes],
  )
  const selectedSizeLabel =
    selectedSizes.length > 0
      ? `${selectedSizes.length} size${selectedSizes.length === 1 ? '' : 's'} selected`
      : 'Choose a size'
  const selectedCategoryLabel =
    productsState.form.tag ||
    (activeCategories.length > 0 ? 'Choose a category' : 'No active categories')

  const toggleSize = (sizeName: string) => {
    if (!selectedSizes.includes(sizeName) && !canAddSize(selectedSizes, sizeName)) {
      return
    }

    const nextSizes = selectedSizes.includes(sizeName)
      ? selectedSizes.filter((selectedSize) => selectedSize !== sizeName)
      : [...selectedSizes, sizeName]

    productsState.updateForm('sizes', formatSelectedSizes(nextSizes))
  }

  const handleSubmit: ProductsState['handleSubmit'] = async (event) => {
    const wasEditing = Boolean(productsState.editingId)
    const didSubmit = await productsState.handleSubmit(event, imageBlob ?? undefined)

    if (didSubmit) {
      onSubmitted?.()
      showToast({
        message: wasEditing
          ? 'Product was updated successfully.'
          : 'Product was added successfully.',
        tone: 'success',
      })
      setImageBlob(null)
    }

    return didSubmit
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:rounded-3xl sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
            {productsState.editingId ? 'Edit Product' : 'New Product'}
          </p>
          <h2 className="mt-2 text-xl font-black text-[#FFF8E7] sm:text-2xl">
            Product Details
          </h2>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close product form"
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 text-lg font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            X
          </button>
        ) : productsState.editingId ? (
          <button
            type="button"
            onClick={() => {
              productsState.resetForm()
              setImageBlob(null)
            }}
            className="shrink-0 cursor-pointer rounded-[10px] border border-[#9C7A42]/70 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
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
        <div className="grid gap-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label=""
              value={productsState.form.price}
              placeholder="Enter your price ( e.g 10 )"
              onChange={(value) => productsState.updateForm('price', value)}
            />
            <label className="grid">
              <button
                type="button"
                onClick={() => setIsSizePickerOpen(true)}
                disabled={activeSizes.length === 0}
                className={`inline-flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 text-left text-sm font-black outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35 disabled:cursor-not-allowed disabled:opacity-60 ${
                  productsState.form.sizes
                    ? 'text-[#FFF8E7]'
                    : 'text-[#B8A98A]/70'
                }`}
              >
                <span className="min-w-0 truncate">
                  {selectedSizeLabel}
                </span>
                <span aria-hidden="true" className="text-[#E4B45A]">
                  +
                </span>
              </button>
            </label>
          </div>
          <div
            className={`grid gap-3 ${
              isDiscountEnabled ? 'sm:grid-cols-2' : 'sm:grid-cols-[1fr_1fr]'
            }`}
          >
            <label className="flex min-h-12 items-center justify-between gap-4 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 py-3">
              <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                Discount
              </span>
              <input
                type="checkbox"
                checked={isDiscountEnabled}
                onChange={(event) => {
                  setIsDiscountEnabled(event.target.checked)

                  if (!event.target.checked) {
                    productsState.updateForm('discountPrice', '')
                  }
                }}
                className="h-5 w-5 accent-[#E4B45A]"
              />
            </label>
            {isDiscountEnabled ? (
              <AdminInput
                label=""
                value={productsState.form.discountPrice ?? ''}
                placeholder="Enter discount price ( e.g 18 )"
                onChange={(value) =>
                  productsState.updateForm('discountPrice', value)
                }
              />
            ) : null}
          </div>
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
            Category
          </span>
          <div
            className="relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsCategoryPickerOpen(false)
              }
            }}
          >
            <button
              type="button"
              onClick={() =>
                setIsCategoryPickerOpen((isOpen) =>
                  activeCategories.length > 0 ? !isOpen : false,
                )
              }
              disabled={activeCategories.length === 0}
              className={`inline-flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 text-left font-semibold outline-none transition hover:border-[#FDD97D] focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35 disabled:cursor-not-allowed disabled:opacity-60 ${
                productsState.form.tag ? 'text-[#FFF8E7]' : 'text-[#B8A98A]/70'
              }`}
              aria-haspopup="listbox"
              aria-expanded={isCategoryPickerOpen}
            >
              <span className="min-w-0 truncate">{selectedCategoryLabel}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className={`h-4 w-4 shrink-0 text-[#E4B45A] transition-transform ${
                  isCategoryPickerOpen ? '' : 'rotate-180'
                }`}
              >
                <path
                  d="M4 10L8 6L12 10"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.25"
                />
              </svg>
            </button>
            {isCategoryPickerOpen ? (
              <div
                role="listbox"
                className="absolute left-0 top-full z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
              >
                {activeCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    role="option"
                    aria-selected={productsState.form.tag === category.name}
                    onClick={() => {
                      productsState.updateForm('tag', category.name)
                      setIsCategoryPickerOpen(false)
                    }}
                    className={`block min-h-11 w-full cursor-pointer px-4 text-left text-sm font-black transition ${
                      productsState.form.tag === category.name
                        ? 'bg-[#E4B45A] text-[#000000]'
                        : 'text-[#B8A98A] hover:bg-[#130E0D] hover:text-[#FDD97D]'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <ProductImagePicker
          accessToken={productsState.accessToken}
          imageUrl={productsState.form.image}
          onBlobChange={setImageBlob}
          onChange={(value) => productsState.updateForm('image', value)}
          productId={productsState.imageProductId}
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

      </div>

      {isSizePickerOpen ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-[#000000]/70 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
          role="presentation"
          onMouseDown={() => setIsSizePickerOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-size-picker-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="max-h-[calc(100vh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.8)] sm:max-h-[calc(100vh-3rem)] sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
                  Product Sizes
                </p>
                <h3
                  id="product-size-picker-title"
                  className="mt-2 text-xl font-black text-[#FFF8E7] sm:text-2xl"
                >
                  Choose a size
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSizePickerOpen(false)}
                aria-label="Close size picker"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 text-xl font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                x
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {activeSizes.map((size) => {
                const isSelected = selectedSizes.includes(size.name)
                const isDisabled =
                  !isSelected && !canAddSize(selectedSizes, size.name)

                return (
                  <button
                    key={size.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggleSize(size.name)}
                    className={`inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border px-4 text-sm font-black uppercase tracking-[0.12em] transition focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] disabled:cursor-not-allowed disabled:opacity-45 ${
                      isSelected
                        ? 'border-[#E4B45A]/70 bg-[#E4B45A] text-[#000000]'
                        : 'border-[#9C7A42]/45 bg-[#000000] text-[#B8A98A] hover:border-[#FDD97D] hover:text-[#FDD97D]'
                    }`}
                  >
                    {size.name}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSizePickerOpen(false)}
                className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] sm:w-auto"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  )
}
