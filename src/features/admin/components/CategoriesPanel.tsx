import { useEffect, useRef, useState } from 'react'
import type { CategoriesState } from '../../categories/hooks/useCategories'
import { useToast } from '../../../shared/toast/useToast'
import { AdminSummaryCard, type AdminSummaryIcon } from './AdminSummaryCard'

type CategoriesPanelProps = {
  categoriesState: CategoriesState
}

type CategoryStatusFilter = 'all' | 'active' | 'draft'

const categoryStatusFilterOptions: Array<{
  label: string
  value: CategoryStatusFilter
}> = [
  { label: 'All categories', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
]

export function CategoriesPanel({ categoriesState }: CategoriesPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CategoryStatusFilter>('all')
  const lastErrorToastRef = useRef('')
  const { showToast } = useToast()

  useEffect(() => {
    if (!categoriesState.error) {
      lastErrorToastRef.current = ''
      return
    }

    if (lastErrorToastRef.current === categoriesState.error) {
      return
    }

    lastErrorToastRef.current = categoriesState.error
    showToast({
      message: categoriesState.error,
      tone: categoriesState.error.includes('not ready yet')
        ? 'warning'
        : 'error',
    })
  }, [categoriesState.error, showToast])

  const closeModal = () => {
    categoriesState.resetForm()
    setIsModalOpen(false)
  }

  const openCreateModal = () => {
    categoriesState.resetForm()
    setIsModalOpen(true)
  }

  const openEditModal: CategoriesState['editCategory'] = (category) => {
    categoriesState.editCategory(category)
    setIsModalOpen(true)
  }

  const handleSubmit: CategoriesState['handleSubmit'] = async (event) => {
    const wasEditing = Boolean(categoriesState.editingId)
    const didSubmit = await categoriesState.handleSubmit(event)

    if (didSubmit) {
      closeModal()
      showToast({
        message: wasEditing
          ? 'Category was updated successfully.'
          : 'Category was added successfully.',
        tone: 'success',
      })
    }

    return didSubmit
  }

  const toggleCategoryStatus = async (
    categoryId: string,
    isActive: boolean,
  ) => {
    const didUpdate = await categoriesState.toggleCategoryStatus(categoryId)

    if (didUpdate) {
      showToast({
        message: isActive
          ? 'Category was moved to draft.'
          : 'Category was published successfully.',
        tone: 'success',
      })
    }
  }

  const deleteCategory = async (categoryId: string) => {
    const didDelete = await categoriesState.deleteCategory(categoryId)

    if (didDelete) {
      showToast({
        message: 'Category was deleted successfully.',
        tone: 'success',
      })
    }
  }
  const activeCategories = categoriesState.categories.filter(
    (category) => category.active,
  ).length
  const draftCategories = categoriesState.categories.length - activeCategories
  const assignedProducts = categoriesState.categories.reduce(
    (total, category) => total + category.productCount,
    0,
  )
  const categorySummaryCards = [
    {
      icon: 'category',
      label: 'Total categories',
      value: categoriesState.categories.length,
    },
    {
      icon: 'active',
      label: 'Active',
      value: activeCategories,
    },
    {
      icon: 'archive',
      label: 'Draft',
      value: draftCategories,
    },
    {
      icon: 'product',
      label: 'Assigned products',
      value: assignedProducts,
    },
  ] satisfies Array<{
    icon: AdminSummaryIcon
    label: string
    value: number
  }>
  const statusFilterLabel =
    categoryStatusFilterOptions.find((option) => option.value === statusFilter)
      ?.label ?? 'All categories'
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredCategories = categoriesState.categories.filter((category) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      category.name.toLowerCase().includes(normalizedSearchTerm)

    if (!matchesSearch) {
      return false
    }

    if (statusFilter === 'active') {
      return category.active
    }

    if (statusFilter === 'draft') {
      return !category.active
    }

    return true
  })

  const selectStatusFilter = (nextStatusFilter: CategoryStatusFilter) => {
    setStatusFilter(nextStatusFilter)
    setIsStatusFilterOpen(false)
  }

  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {categorySummaryCards.map((card) => (
          <AdminSummaryCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
          />
        ))}
      </section>

      <section className="py-4 sm:py-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_minmax(14rem,1fr)_auto] xl:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-normal uppercase tracking-[0.14em] text-[#B8A98A]">
              Search
            </span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search categories"
              className="min-h-12 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
            />
          </label>
          <div className="grid gap-2">
            <span className="text-sm font-normal uppercase tracking-[0.14em] text-[#B8A98A]">
              Filter Status
            </span>
            <div
              className="relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsStatusFilterOpen(false)
                }
              }}
            >
              <button
                type="button"
                onClick={() => setIsStatusFilterOpen((isOpen) => !isOpen)}
                className="inline-flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-left text-[#FFF8E7] outline-none transition hover:border-[#FDD97D] focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                aria-haspopup="listbox"
                aria-expanded={isStatusFilterOpen}
              >
                <span className="min-w-0 truncate">{statusFilterLabel}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className={`h-4 w-4 shrink-0 text-[#E4B45A] transition-transform ${
                    isStatusFilterOpen ? '' : 'rotate-180'
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
              {isStatusFilterOpen ? (
                <div
                  role="listbox"
                  className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
                >
                  {categoryStatusFilterOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={statusFilter === option.value}
                      onClick={() => selectStatusFilter(option.value)}
                      className={`block min-h-11 w-full cursor-pointer px-4 text-left text-sm font-black transition ${
                        statusFilter === option.value
                          ? 'bg-[#E4B45A] text-[#000000]'
                          : 'text-[#B8A98A] hover:bg-[#130E0D] hover:text-[#FDD97D]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] md:w-auto md:px-7 md:tracking-[0.14em]"
          >
            Add New Category
          </button>
        </div>
      </section>

      {categoriesState.error ? (
        <p className="rounded-[10px] border border-[#E46D5A]/45 bg-[#2A0F0A] px-4 py-3 text-sm font-semibold text-[#FFD0C7]">
          {categoriesState.error}
        </p>
      ) : null}

      <section>
        {filteredCategories.length > 0 ? (
          <div className="grid gap-3 md:hidden">
            {filteredCategories.map((category) => {
              const statusLabel = category.active ? 'Active' : 'Draft'

              return (
                <article
                  key={category.id}
                  className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-black text-[#FFF8E7]">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm font-black text-[#E4B45A]">
                        {category.productCount} products
                      </p>
                    </div>
                    <span className="inline-flex min-h-8 shrink-0 items-center justify-center rounded-[10px] border border-[#9C7A42]/45 px-3 text-xs font-black uppercase tracking-[0.1em] text-[#B8A98A]">
                      {statusLabel}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(category)}
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-3 text-xs font-black uppercase tracking-[0.1em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toggleCategoryStatus(category.id, category.active)
                      }
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-3 text-xs font-black uppercase tracking-[0.1em] text-[#E4B45A] transition hover:bg-[#E4B45A] hover:text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
                    >
                      {category.active ? 'Draft' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(category.id)}
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-3 text-xs font-black uppercase tracking-[0.1em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] px-4 py-8 text-center text-sm font-semibold text-[#B8A98A] md:hidden">
            No categories found.
          </p>
        )}

        <div className="hidden overflow-x-auto rounded-lg border border-[#9C7A42]/25 bg-[#000000] md:block">
          <table className="min-w-[680px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#9C7A42]/25 bg-[#130E0D] text-xs font-black uppercase tracking-[0.16em] text-[#B8A98A]">
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Products</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => {
                const statusLabel = category.active ? 'Active' : 'Draft'

                return (
                  <tr
                    key={category.id}
                    className="border-b border-[#9C7A42]/15 last:border-b-0"
                  >
                    <td className="px-4 py-4 text-base font-black text-[#FFF8E7]">
                      {category.name}
                    </td>
                    <td className="px-4 py-4 text-sm font-black text-[#E4B45A]">
                      {category.productCount}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex min-h-8 items-center justify-center rounded-[10px] border border-[#9C7A42]/45 px-3 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A]">
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(category)}
                          className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-4 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            toggleCategoryStatus(category.id, category.active)
                          }
                          className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-4 text-xs font-black uppercase tracking-[0.12em] text-[#E4B45A] transition hover:bg-[#E4B45A] hover:text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
                        >
                          {category.active ? 'Draft' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(category.id)}
                          className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-4 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm font-semibold text-[#B8A98A]"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#000000]/75 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
          role="presentation"
          onMouseDown={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="max-h-[calc(100vh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.75)] sm:max-h-[calc(100vh-3rem)] sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
                  {categoriesState.editingId ? 'Edit Category' : 'New Category'}
                </p>
                <h3
                  id="category-modal-title"
                  className="mt-2 text-xl font-black text-[#FFF8E7] sm:text-2xl"
                >
                  Category details
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close category popup"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 text-xl font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                x
              </button>
            </div>

            <label className="mt-6 grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                Name
              </span>
              <input
                value={categoriesState.form.name}
                onChange={(event) =>
                  categoriesState.updateForm('name', event.target.value)
                }
                placeholder="Sneakers"
                className="min-h-12 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
              />
            </label>

            <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 py-3">
              <span>
                <span className="block text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                  Active
                </span>
                <span className="mt-1 block text-sm font-semibold text-[#B8A98A]/75">
                  {categoriesState.form.active ? 'Published' : 'Draft'}
                </span>
              </span>
              <input
                type="checkbox"
                checked={categoriesState.form.active}
                onChange={(event) =>
                  categoriesState.updateForm('active', event.target.checked)
                }
                className="h-5 w-5 accent-[#E4B45A]"
              />
            </label>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                {categoriesState.editingId ? 'Save Category' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
