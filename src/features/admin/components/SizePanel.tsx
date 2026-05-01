import { useEffect, useRef, useState } from 'react'
import type { SizesState } from '../../sizes/hooks/useSizes'
import { useToast } from '../../../shared/toast/useToast'
import { AdminInput } from './AdminInput'

type SizePanelProps = {
  sizesState: SizesState
}

export function SizePanel({ sizesState }: SizePanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const lastErrorToastRef = useRef('')
  const { showToast } = useToast()
  const sizeSourceLabel = sizesState.isLoading
    ? 'loading'
    : sizesState.source === 'supabase'
      ? 'Supabase'
      : 'local fallback'

  useEffect(() => {
    if (!sizesState.error) {
      lastErrorToastRef.current = ''
      return
    }

    if (lastErrorToastRef.current === sizesState.error) {
      return
    }

    lastErrorToastRef.current = sizesState.error
    showToast({
      message: sizesState.error,
      tone: sizesState.error.includes('not ready yet') ? 'warning' : 'error',
    })
  }, [showToast, sizesState.error])

  const closeModal = () => {
    sizesState.resetForm()
    setIsModalOpen(false)
  }

  const handleSubmit: SizesState['handleSubmit'] = async (event) => {
    const didSubmit = await sizesState.handleSubmit(event)

    if (didSubmit) {
      closeModal()
      showToast({
        message: 'Size was added successfully.',
        tone: 'success',
      })
    }

    return didSubmit
  }

  const toggleSizeStatus = async (sizeId: string, isActive: boolean) => {
    const didUpdate = await sizesState.toggleSizeStatus(sizeId)

    if (didUpdate) {
      showToast({
        message: isActive
          ? 'Size was disabled successfully.'
          : 'Size was activated successfully.',
        tone: 'success',
      })
    }
  }

  const deleteSize = async (sizeId: string) => {
    const didDelete = await sizesState.deleteSize(sizeId)

    if (didDelete) {
      showToast({
        message: 'Size was deleted successfully.',
        tone: 'success',
      })
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
              Size Management
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#FFF8E7]">
              Product sizes
            </h2>
            <p className="mt-3 max-w-2xl text-[#B8A98A]">
              Manage available size names and whether each size is active.
              Size data is using{' '}
              <span className="font-black text-[#FDD97D]">
                {sizeSourceLabel}
              </span>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            Add New Size
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
              Sizes
            </p>
          </div>
          <span className="text-sm font-semibold text-[#B8A98A]">
            {sizesState.sizes.length} total
          </span>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-[#9C7A42]/25 bg-[#000000]">
          <table className="min-w-[620px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#9C7A42]/25 text-xs font-black uppercase tracking-[0.16em] text-[#B8A98A]">
                <th className="px-4 py-4">Size name</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sizesState.sizes.map((size) => {
                const statusLabel = size.active ? 'Active' : 'Disabled'

                return (
                  <tr
                    key={size.id}
                    className="border-b border-[#9C7A42]/15 last:border-b-0"
                  >
                    <td className="px-4 py-4 text-base font-black text-[#FFF8E7]">
                      {size.name}
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
                          onClick={() =>
                            toggleSizeStatus(size.id, size.active)
                          }
                          className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-4 text-xs font-black uppercase tracking-[0.12em] text-[#E4B45A] transition hover:bg-[#E4B45A] hover:text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
                        >
                          {size.active ? 'Disable' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSize(size.id)}
                          className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-4 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {sizesState.sizes.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm font-semibold text-[#B8A98A]"
                  >
                    No sizes yet.
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
            aria-labelledby="size-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.75)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
                  New Size
                </p>
                <h3
                  id="size-modal-title"
                  className="mt-2 text-2xl font-black text-[#FFF8E7]"
                >
                  Size details
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close size popup"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 text-xl font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                x
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <AdminInput
                label="Size name"
                value={sizesState.form.name}
                placeholder="EU 42"
                onChange={(value) => sizesState.updateForm('name', value)}
              />

              <label className="flex items-center justify-between gap-4 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] px-4 py-3">
                <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                  Active
                </span>
                <input
                  type="checkbox"
                  checked={sizesState.form.active}
                  onChange={(event) =>
                    sizesState.updateForm('active', event.target.checked)
                  }
                  className="h-5 w-5 accent-[#E4B45A]"
                />
              </label>
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
                Add Size
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
