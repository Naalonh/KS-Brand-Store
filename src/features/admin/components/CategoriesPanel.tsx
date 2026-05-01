import { useState, type FormEvent } from 'react'
import { AdminInput } from './AdminInput'

type Category = {
  description: string
  id: string
  name: string
  productCount: number
  status: 'Active' | 'Draft'
}

const defaultCategories: Category[] = [
  {
    description: 'Launch styles and newest arrivals for the storefront.',
    id: 'new-arrivals',
    name: 'New Arrivals',
    productCount: 3,
    status: 'Active',
  },
  {
    description: 'Everyday sneakers and premium casual pairs.',
    id: 'sneakers',
    name: 'Sneakers',
    productCount: 2,
    status: 'Active',
  },
  {
    description: 'Leather court silhouettes and refined low-top designs.',
    id: 'court-shoes',
    name: 'Court Shoes',
    productCount: 1,
    status: 'Active',
  },
  {
    description: 'Seasonal edits prepared for upcoming drops.',
    id: 'limited-drops',
    name: 'Limited Drops',
    productCount: 0,
    status: 'Draft',
  },
]

const emptyCategoryForm = {
  description: '',
  name: '',
}

const createCategoryId = (name: string) =>
  `${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}-${Date.now()}`

export function CategoriesPanel() {
  const [categories, setCategories] = useState(defaultCategories)
  const [form, setForm] = useState(emptyCategoryForm)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const closeModal = () => {
    setForm(emptyCategoryForm)
    setIsModalOpen(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextCategory = {
      description: form.description.trim(),
      name: form.name.trim(),
    }

    if (!nextCategory.name || !nextCategory.description) {
      return
    }

    setCategories((currentCategories) => [
      {
        ...nextCategory,
        id: createCategoryId(nextCategory.name),
        productCount: 0,
        status: 'Draft',
      },
      ...currentCategories,
    ])
    closeModal()
  }

  const toggleStatus = (categoryId: string) => {
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              status: category.status === 'Active' ? 'Draft' : 'Active',
            }
          : category,
      ),
    )
  }

  const deleteCategory = (categoryId: string) => {
    setCategories((currentCategories) =>
      currentCategories.filter((category) => category.id !== categoryId),
    )
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
              Category Management
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#FFF8E7]">
              Store categories
            </h2>
            <p className="mt-3 max-w-2xl text-[#B8A98A]">
              Organize products into storefront groups for browsing and future
              filters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            Add New Category
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
              Categories
            </p>
            <h3 className="mt-2 text-2xl font-black text-[#FFF8E7]">
              Category table
            </h3>
          </div>
          <span className="text-sm font-semibold text-[#B8A98A]">
            {categories.length} total
          </span>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-[#9C7A42]/25 bg-[#000000]">
          <table className="min-w-[820px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#9C7A42]/25 text-xs font-black uppercase tracking-[0.16em] text-[#B8A98A]">
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Description</th>
                <th className="px-4 py-4">Products</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-[#9C7A42]/15 last:border-b-0"
                >
                  <td className="px-4 py-4 text-base font-black text-[#FFF8E7]">
                    {category.name}
                  </td>
                  <td className="max-w-md px-4 py-4 text-sm leading-6 text-[#B8A98A]">
                    {category.description}
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-[#E4B45A]">
                    {category.productCount}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex min-h-8 items-center justify-center rounded-[10px] border border-[#9C7A42]/45 px-3 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A]">
                      {category.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleStatus(category.id)}
                        className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-4 text-xs font-black uppercase tracking-[0.12em] text-[#E4B45A] transition hover:bg-[#E4B45A] hover:text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
                      >
                        {category.status === 'Active' ? 'Draft' : 'Publish'}
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
              ))}

              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm font-semibold text-[#B8A98A]"
                  >
                    No categories yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#000000]/75 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
                  New Category
                </p>
                <h3
                  id="category-modal-title"
                  className="mt-2 text-2xl font-black text-[#FFF8E7]"
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

            <div className="mt-6 grid gap-4">
              <AdminInput
                label="Name"
                value={form.name}
                placeholder="Sneakers"
                onChange={(value) =>
                  setForm((currentForm) => ({ ...currentForm, name: value }))
                }
              />
              <AdminInput
                label="Description"
                value={form.description}
                placeholder="Everyday sneakers and premium casual pairs"
                onChange={(value) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    description: value,
                  }))
                }
              />
            </div>

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
                Add Category
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
