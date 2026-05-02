import { useEffect, useRef, useState } from 'react'
import type { SizesState } from '../../sizes/hooks/useSizes'
import { useToast } from '../../../shared/toast/useToast'
import { AdminInput } from './AdminInput'
import { AdminSummaryCard, type AdminSummaryIcon } from './AdminSummaryCard'

type SizePanelProps = {
  sizesState: SizesState
}

const getSizeSortParts = (name: string) => {
  const match = name.trim().match(/^([a-zA-Z]+)\s*(\d+)/)

  if (!match) {
    return {
      letter: name.trim().toLowerCase(),
      number: Number.POSITIVE_INFINITY,
    }
  }

  return {
    letter: match[1].toLowerCase(),
    number: Number(match[2]),
  }
}

const compareSizeNames = (firstName: string, secondName: string) => {
  const first = getSizeSortParts(firstName)
  const second = getSizeSortParts(secondName)
  const letterSort = first.letter.localeCompare(second.letter)

  if (letterSort !== 0) {
    return letterSort
  }

  if (first.number !== second.number) {
    return first.number - second.number
  }

  return firstName.localeCompare(secondName, undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

const getSizeStatusBadgeClass = (isActive: boolean) =>
  isActive
    ? 'border-[#4ADE80]/45 bg-[#4ADE80]/10 text-[#15803D]'
    : 'border-[#D46A5E]/45 bg-[#D46A5E]/10 text-[#B45B50]'

const deleteButtonClass =
  'inline-flex cursor-pointer items-center justify-center rounded-[10px] border border-[#D46A5E]/45 px-3 text-xs font-normal uppercase tracking-[0.1em] text-[#B45B50] transition hover:border-[#D46A5E]/75 hover:bg-[#D46A5E]/10 hover:text-[#8F342B] focus:outline-none focus:ring-2 focus:ring-[#D46A5E]/45 focus:ring-offset-2 focus:ring-offset-[#000000]'

export function SizePanel({ sizesState }: SizePanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const lastErrorToastRef = useRef('')
  const { showToast } = useToast()

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

  const totalSizes = sizesState.sizes.length
  const activeSizes = sizesState.sizes.filter((size) => size.active).length
  const disabledSizes = totalSizes - activeSizes
  const sizeSummaryCards = [
    {
      icon: 'size',
      label: 'Total sizes',
      value: totalSizes,
    },
    {
      icon: 'active',
      label: 'Active',
      value: activeSizes,
    },
    {
      icon: 'hidden',
      label: 'Disabled',
      value: disabledSizes,
    },
  ] satisfies Array<{
    icon: AdminSummaryIcon
    label: string
    value: number
  }>
  const sortedSizes = [...sizesState.sizes].sort((firstSize, secondSize) =>
    compareSizeNames(firstSize.name, secondSize.name),
  )

  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {sizeSummaryCards.map((card) => (
          <AdminSummaryCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
          />
        ))}
      </section>

      <section className="p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-normal text-[#FFF8E7] sm:text-3xl">
              Product sizes
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-5 text-sm font-normal uppercase tracking-[0.12em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] sm:w-auto sm:px-7 sm:tracking-[0.14em]"
          >
            Add New Size
          </button>
        </div>
      </section>

      <section>
        {sortedSizes.length > 0 ? (
          <div className="grid gap-3 md:hidden">
            {sortedSizes.map((size) => {
              const statusLabel = size.active ? 'Active' : 'Disabled'

              return (
                <article
                  key={size.id}
                  className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 break-words text-lg font-normal text-[#FFF8E7]">
                      {size.name}
                    </h3>
                    <span
                      className={`inline-flex min-h-8 shrink-0 items-center justify-center rounded-[10px] border px-3 text-xs font-normal uppercase tracking-[0.1em] ${getSizeStatusBadgeClass(size.active)}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        toggleSizeStatus(size.id, size.active)
                      }
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-3 text-xs font-normal uppercase tracking-[0.1em] text-[#E4B45A] transition hover:bg-[#E4B45A] hover:text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
                    >
                      {size.active ? 'Disable' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSize(size.id)}
                      className={`${deleteButtonClass} min-h-10`}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] px-4 py-8 text-center text-sm font-normal text-[#B8A98A] md:hidden">
            No sizes yet.
          </p>
        )}

        <div className="hidden overflow-x-auto rounded-lg border border-[#9C7A42]/25 bg-[#000000] md:block">
          <table className="min-w-155 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#9C7A42]/25 bg-[#130E0D] text-xs font-normal uppercase tracking-[0.16em] text-[#B8A98A]">
                <th className="px-4 py-4">Size name</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSizes.map((size) => {
                const statusLabel = size.active ? 'Active' : 'Disabled'

                return (
                  <tr
                    key={size.id}
                    className="border-b border-[#9C7A42]/15 last:border-b-0"
                  >
                    <td className="px-4 py-4 text-base font-normal text-[#FFF8E7]">
                      {size.name}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex min-h-8 items-center justify-center rounded-[10px] border px-3 text-xs font-normal uppercase tracking-[0.12em] ${getSizeStatusBadgeClass(size.active)}`}
                      >
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
                          className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-4 text-xs font-normal uppercase tracking-[0.12em] text-[#E4B45A] transition hover:bg-[#E4B45A] hover:text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
                        >
                          {size.active ? 'Disable' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSize(size.id)}
                          className={`${deleteButtonClass} min-h-9 px-4 tracking-[0.12em]`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {sortedSizes.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm font-normal text-[#B8A98A]"
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
          className="fixed inset-0 z-50 grid place-items-center bg-[#000000]/75 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
          role="presentation"
          onMouseDown={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="max-h-[calc(100vh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.75)] sm:max-h-[calc(100vh-3rem)] sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-normal uppercase tracking-[0.18em] text-[#E4B45A]">
                  New Size
                </p>
                <h3
                  id="size-modal-title"
                  className="mt-2 text-xl font-normal text-[#FFF8E7] sm:text-2xl"
                >
                  Size details
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close size popup"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 text-xl font-normal text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
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
                <span className="text-sm font-normal uppercase tracking-[0.14em] text-[#B8A98A]">
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
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-6 text-sm font-normal uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-6 text-sm font-normal uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
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
