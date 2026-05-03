import { useMemo, useState } from 'react'
import type { CategoriesState } from '../../categories/hooks/useCategories'
import type { ProductsState } from '../../products/hooks/useProducts'
import {
  formatProductCategories,
  getProductCategories,
} from '../../products/utils/productCategories'
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
const maxProductCategoriesLength = 512

const formatSelectedSizes = (sizes: string[]) => sizes.join(', ')

const canAddSize = (selectedSizes: string[], sizeName: string) =>
  selectedSizes.length < maxSelectedSizes &&
  formatSelectedSizes([...selectedSizes, sizeName]).length <=
    maxProductSizesLength

const canAddCategory = (
  selectedCategories: string[],
  categoryName: string,
) =>
  formatProductCategories([...selectedCategories, categoryName]).length <=
    maxProductCategoriesLength

const getHighlightedNameParts = (name: string, searchTerm: string) => {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()

  if (!normalizedSearchTerm) {
    return { after: '', before: name, match: '' }
  }

  const matchIndex = name.toLowerCase().indexOf(normalizedSearchTerm)

  if (matchIndex < 0) {
    return { after: '', before: name, match: '' }
  }

  return {
    after: name.slice(matchIndex + normalizedSearchTerm.length),
    before: name.slice(0, matchIndex),
    match: name.slice(matchIndex, matchIndex + normalizedSearchTerm.length),
  }
}

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
  const [isNameSuggestionOpen, setIsNameSuggestionOpen] = useState(false)
  const [isSizePickerOpen, setIsSizePickerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  const activeCategoryNames = useMemo(
    () => activeCategories.map((category) => category.name),
    [activeCategories],
  )
  const selectedSizes = useMemo(
    () => getSelectedSizes(productsState.form.sizes),
    [productsState.form.sizes],
  )
  const selectedCategories = useMemo(
    () => getProductCategories(productsState.form.tag),
    [productsState.form.tag],
  )
  const selectedActiveCategoryNames = useMemo(
    () =>
      activeCategoryNames.filter((categoryName) =>
        selectedCategories.includes(categoryName),
      ),
    [activeCategoryNames, selectedCategories],
  )
  const productNameSearchTerm = productsState.form.name.trim()
  const productNameSuggestions = useMemo(() => {
    const normalizedSearchTerm = productNameSearchTerm.toLowerCase()

    if (!normalizedSearchTerm) {
      return []
    }

    return Array.from(
      new Map(
        productsState.products
          .filter((product) =>
            product.name.toLowerCase().includes(normalizedSearchTerm),
          )
          .map((product) => [product.name.toLowerCase(), product.name]),
      ).values(),
    ).slice(0, 6)
  }, [productNameSearchTerm, productsState.products])
  const selectedSizeLabel =
    selectedSizes.length > 0
      ? `${selectedSizes.length} size${selectedSizes.length === 1 ? '' : 's'} selected`
      : 'Choose a size'
  const selectedCategoryLabel =
    selectedCategories.length > 0
      ? `${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'} selected`
      : activeCategories.length > 0
        ? 'Choose categories'
        : 'No active categories'
  const areAllCategoriesSelected =
    activeCategoryNames.length > 0 &&
    activeCategoryNames.every((categoryName) =>
      selectedCategories.includes(categoryName),
    )

  const toggleSize = (sizeName: string) => {
    if (!selectedSizes.includes(sizeName) && !canAddSize(selectedSizes, sizeName)) {
      return
    }

    const nextSizes = selectedSizes.includes(sizeName)
      ? selectedSizes.filter((selectedSize) => selectedSize !== sizeName)
      : [...selectedSizes, sizeName]

    productsState.updateForm('sizes', formatSelectedSizes(nextSizes))
  }

  const toggleCategory = (categoryName: string) => {
    if (
      !selectedCategories.includes(categoryName) &&
      !canAddCategory(selectedCategories, categoryName)
    ) {
      return
    }

    const nextCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(
          (selectedCategory) => selectedCategory !== categoryName,
        )
      : [...selectedCategories, categoryName]

    productsState.updateForm('tag', formatProductCategories(nextCategories))
  }

  const selectAllCategories = () => {
    productsState.updateForm('tag', formatProductCategories(activeCategoryNames))
  }

  const handleSubmit: ProductsState['handleSubmit'] = async (event) => {
    if (isSubmitting) {
      event.preventDefault()
      return false
    }

    const wasEditing = Boolean(productsState.editingId)
    setIsSubmitting(true)

    try {
      const didSubmit = await productsState.handleSubmit(
        event,
        imageBlob ?? undefined,
      )

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
    } finally {
      setIsSubmitting(false)
    }
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
        <div
          className="relative grid gap-2"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsNameSuggestionOpen(false)
            }
          }}
        >
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
              Name
            </span>
            <input
              value={productsState.form.name}
              onChange={(event) => {
                productsState.updateForm('name', event.target.value)
                setIsNameSuggestionOpen(true)
              }}
              onFocus={() => setIsNameSuggestionOpen(true)}
              placeholder="Enter product name"
              required
              className="min-h-12 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
            />
          </label>
          {isNameSuggestionOpen && productNameSuggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
              {productNameSuggestions.map((name) => {
                const highlightedNameParts = getHighlightedNameParts(
                  name,
                  productNameSearchTerm,
                )

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      productsState.updateForm('name', name)
                      setIsNameSuggestionOpen(false)
                    }}
                    className="block min-h-11 w-full cursor-pointer rounded-[8px] px-3 text-left text-sm font-black text-[#B8A98A] transition hover:bg-[#130E0D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D]"
                  >
                    {highlightedNameParts.before}
                    {highlightedNameParts.match ? (
                      <span className="text-[#FDD97D]">
                        {highlightedNameParts.match}
                      </span>
                    ) : null}
                    {highlightedNameParts.after}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
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
            Categories
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
                aria-multiselectable="true"
                className="absolute left-0 top-full z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={areAllCategoriesSelected}
                  onClick={selectAllCategories}
                  className={`mb-2 flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-[8px] border px-3 text-left text-sm font-black transition ${
                    areAllCategoriesSelected
                      ? 'border-[#E4B45A] bg-[#130E0D] text-[#FDD97D]'
                      : 'border-[#9C7A42]/35 bg-[#130E0D] text-[#E4B45A] hover:border-[#FDD97D] hover:text-[#FDD97D]'
                  }`}
                >
                  <span className="min-w-0 truncate">Select All</span>
                  {areAllCategoriesSelected ? (
                    <span
                      aria-hidden="true"
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#E4B45A] text-[0.65rem] font-black leading-none text-[#000000]"
                    >
                      ✓
                    </span>
                  ) : null}
                </button>
                {activeCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.name)
                  const selectedIndex =
                    selectedActiveCategoryNames.indexOf(category.name)
                  const selectedCount = selectedActiveCategoryNames.length
                  const selectedRadiusClass =
                    selectedCount === 1
                      ? 'rounded-[8px]'
                      : selectedIndex === 0
                        ? 'rounded-t-[8px]'
                        : selectedIndex === selectedCount - 1
                          ? 'rounded-b-[8px]'
                          : 'rounded-none'
                  const isDisabled =
                    !isSelected &&
                    !canAddCategory(selectedCategories, category.name)

                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={isDisabled}
                      onClick={() => toggleCategory(category.name)}
                      className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-3 text-left text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
                        isSelected
                          ? `${selectedRadiusClass} bg-[#130E0D] text-[#FFF8E7]`
                          : 'rounded-[8px] text-[#B8A98A] hover:bg-[#130E0D] hover:text-[#FDD97D]'
                      }`}
                    >
                      <span className="min-w-0 truncate">{category.name}</span>
                      {isSelected ? (
                        <span
                          aria-hidden="true"
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#E4B45A] text-[0.65rem] font-black leading-none text-[#000000]"
                        >
                          ✓
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
          {selectedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <span
                  key={category}
                  className="inline-flex min-h-8 max-w-full items-center rounded-[8px] border border-[#9C7A42]/40 px-3 text-xs font-black uppercase tracking-[0.08em] text-[#E4B45A]"
                >
                  <span className="truncate">{category}</span>
                </span>
              ))}
            </div>
          ) : null}
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
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="relative inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-[10px] bg-[#E4B45A] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] disabled:cursor-wait disabled:opacity-90"
        >
          <span className="relative z-10">
            {isSubmitting
              ? 'Processing...'
              : productsState.editingId
                ? 'Save Product'
                : 'Add Product'}
          </span>
          {isSubmitting ? (
            <span
              aria-hidden="true"
              className="product-submit-progress absolute bottom-0 left-0 h-1 w-full bg-[#000000]/80"
            />
          ) : null}
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
