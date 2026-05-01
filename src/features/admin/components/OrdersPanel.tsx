import { useState } from 'react'
import type { ProductsState } from '../../products/hooks/useProducts'
import { useOrders } from '../../orders/hooks/useOrders'
import type { OrderStatus } from '../../orders/types'
import { useToast } from '../../../shared/toast/useToast'

type OrdersPanelProps = {
  productsState: ProductsState
}

const orderStatuses: Array<{
  label: string
  value: OrderStatus
}> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Fulfilled', value: 'fulfilled' },
  { label: 'Cancelled', value: 'cancelled' },
]

const formatOrderDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))

const getAvailableSizes = (sizes: string) => {
  const normalizedSizes = sizes.trim()

  if (!normalizedSizes) {
    return []
  }

  const rangeMatch = normalizedSizes.match(/^([A-Za-z]+\s*)?(\d+)\s*-\s*(\d+)$/)

  if (rangeMatch) {
    const prefix = rangeMatch[1]?.trim()
    const start = Number.parseInt(rangeMatch[2], 10)
    const end = Number.parseInt(rangeMatch[3], 10)
    const min = Math.min(start, end)
    const max = Math.max(start, end)

    return Array.from({ length: max - min + 1 }, (_, index) =>
      [prefix, min + index].filter(Boolean).join(' '),
    )
  }

  return normalizedSizes
    .split(/[,/|]+/)
    .map((size) => size.trim())
    .filter(Boolean)
}

export function OrdersPanel({ productsState }: OrdersPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSizePickerOpen, setIsSizePickerOpen] = useState(false)
  const { showToast } = useToast()
  const ordersState = useOrders(productsState.products)
  const hasProducts = ordersState.productOptions.length > 0
  const availableSizes = getAvailableSizes(
    ordersState.selectedProduct?.sizes ?? '',
  )
  const closeModal = () => {
    ordersState.resetForm()
    setIsSizePickerOpen(false)
    setIsModalOpen(false)
  }

  const handleSubmit: typeof ordersState.handleSubmit = (event) => {
    const didSubmit = ordersState.handleSubmit(event)

    if (didSubmit) {
      setIsSizePickerOpen(false)
      setIsModalOpen(false)
      showToast({
        message: 'Order was created successfully.',
        tone: 'success',
      })
    }

    return didSubmit
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const didUpdate = ordersState.updateOrderStatus(orderId, status)

    if (didUpdate) {
      const statusLabel =
        orderStatuses.find((currentStatus) => currentStatus.value === status)
          ?.label ?? status

      showToast({
        message: `Order status changed to ${statusLabel}.`,
        tone: 'success',
      })
    }
  }

  const deleteOrder = (orderId: string) => {
    const didDelete = ordersState.deleteOrder(orderId)

    if (didDelete) {
      showToast({
        message: 'Order was deleted successfully.',
        tone: 'success',
      })
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:rounded-3xl sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
              Order Management
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#FFF8E7] sm:text-3xl">
              Orders
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={!hasProducts}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-7 sm:tracking-[0.14em]"
          >
            Create Order
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:rounded-3xl sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
            Orders
          </p>
          <span className="text-sm font-semibold text-[#B8A98A]">
            {ordersState.orders.length} total
          </span>
        </div>

        {ordersState.orders.length > 0 ? (
          <div className="mt-6 grid gap-3 md:hidden">
            {ordersState.orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-base font-black text-[#FFF8E7]">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#B8A98A]">
                      {formatOrderDate(order.createdAt)}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(event) =>
                      updateOrderStatus(
                        order.id,
                        event.target.value as OrderStatus,
                      )
                    }
                    className="min-h-9 max-w-[8rem] shrink-0 cursor-pointer rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] px-2 text-xs font-black uppercase tracking-[0.08em] text-[#B8A98A] outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 grid gap-3 text-sm font-semibold text-[#B8A98A]">
                  <div className="rounded-[10px] border border-[#9C7A42]/25 p-3">
                    <span className="block text-xs font-black uppercase tracking-[0.12em] text-[#9C7A42]">
                      Customer
                    </span>
                    <span className="mt-1 block break-words text-[#FFF8E7]">
                      {order.customerName}
                    </span>
                    <span className="mt-1 block break-words">
                      {order.customerPhone}
                    </span>
                  </div>
                  <div className="rounded-[10px] border border-[#9C7A42]/25 p-3">
                    <span className="block text-xs font-black uppercase tracking-[0.12em] text-[#9C7A42]">
                      Product
                    </span>
                    <span className="mt-1 block break-words text-[#FFF8E7]">
                      {order.productName}
                    </span>
                    <span className="mt-1 block break-words">
                      Size {order.size} / {order.unitPrice}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[10px] border border-[#9C7A42]/25 p-3">
                      <span className="block text-xs font-black uppercase tracking-[0.12em] text-[#9C7A42]">
                        Qty
                      </span>
                      <span className="mt-1 block font-black text-[#E4B45A]">
                        {order.quantity}
                      </span>
                    </div>
                    <div className="rounded-[10px] border border-[#9C7A42]/25 p-3">
                      <span className="block text-xs font-black uppercase tracking-[0.12em] text-[#9C7A42]">
                        Total
                      </span>
                      <span className="mt-1 block font-black text-[#FFF8E7]">
                        {order.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteOrder(order.id)}
                  className="mt-4 inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-4 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] px-4 py-8 text-center text-sm font-semibold text-[#B8A98A] md:hidden">
            No orders yet.
          </p>
        )}

        <div className="mt-6 hidden overflow-x-auto rounded-lg border border-[#9C7A42]/25 bg-[#000000] md:block">
          <table className="min-w-[920px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#9C7A42]/25 text-xs font-black uppercase tracking-[0.16em] text-[#B8A98A]">
                <th className="px-4 py-4">Order</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4">Qty</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersState.orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#9C7A42]/15 last:border-b-0"
                >
                  <td className="px-4 py-4">
                    <p className="text-sm font-black text-[#FFF8E7]">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#B8A98A]">
                      {formatOrderDate(order.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-black text-[#FFF8E7]">
                      {order.customerName}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#B8A98A]">
                      {order.customerPhone}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-black text-[#FFF8E7]">
                      {order.productName}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#B8A98A]">
                      Size {order.size} / {order.unitPrice}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-[#E4B45A]">
                    {order.quantity}
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-[#FFF8E7]">
                    {order.totalPrice}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        updateOrderStatus(
                          order.id,
                          event.target.value as OrderStatus,
                        )
                      }
                      className="min-h-9 cursor-pointer rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] px-3 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => deleteOrder(order.id)}
                      className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-4 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {ordersState.orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm font-semibold text-[#B8A98A]"
                  >
                    No orders yet.
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
            aria-labelledby="order-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="max-h-[calc(100vh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.75)] sm:max-h-[calc(100vh-3rem)] sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
                  New Order
                </p>
                <h3
                  id="order-modal-title"
                  className="mt-2 text-xl font-black text-[#FFF8E7] sm:text-2xl"
                >
                  Order details
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close order popup"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 text-xl font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                x
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                    Customer name
                  </span>
                  <input
                    value={ordersState.form.customerName}
                    onChange={(event) =>
                      ordersState.updateForm(
                        'customerName',
                        event.target.value,
                      )
                    }
                    placeholder="Customer name"
                    required
                    className="min-h-12 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                    Phone
                  </span>
                  <input
                    value={ordersState.form.customerPhone}
                    onChange={(event) =>
                      ordersState.updateForm(
                        'customerPhone',
                        event.target.value,
                      )
                    }
                    placeholder="Customer phone"
                    required
                    className="min-h-12 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                  Address
                </span>
                <input
                  value={ordersState.form.customerAddress}
                  onChange={(event) =>
                    ordersState.updateForm(
                      'customerAddress',
                      event.target.value,
                    )
                  }
                  placeholder="Delivery address"
                  className="min-h-12 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                />
              </label>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.5fr_0.7fr]">
                <label className="grid gap-2">
                  <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                    Product
                  </span>
                  <select
                    value={ordersState.form.productId}
                    onChange={(event) => {
                      ordersState.updateForm('productId', event.target.value)
                      ordersState.updateForm('size', '')
                    }}
                    required
                    disabled={!hasProducts}
                    className="min-h-12 cursor-pointer rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {ordersState.productOptions.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.price}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                    Size
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizePickerOpen(true)}
                    disabled={availableSizes.length === 0}
                    className={`inline-flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-left text-sm font-black outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35 disabled:cursor-not-allowed disabled:opacity-60 ${
                      ordersState.form.size
                        ? 'text-[#FFF8E7]'
                        : 'text-[#B8A98A]/70'
                    }`}
                  >
                    <span className="min-w-0 truncate">
                      {ordersState.form.size || 'Choose a size'}
                    </span>
                    <span aria-hidden="true" className="text-[#E4B45A]">
                      +
                    </span>
                  </button>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                    Qty
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={ordersState.form.quantity}
                    onChange={(event) =>
                      ordersState.updateForm('quantity', event.target.value)
                    }
                    required
                    className="min-h-12 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                    Status
                  </span>
                  <select
                    value={ordersState.form.status}
                    onChange={(event) =>
                      ordersState.updateForm(
                        'status',
                        event.target.value as OrderStatus,
                      )
                    }
                    className="min-h-12 cursor-pointer rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                  Note
                </span>
                <textarea
                  value={ordersState.form.note}
                  onChange={(event) =>
                    ordersState.updateForm('note', event.target.value)
                  }
                  placeholder="Order note"
                  rows={3}
                  className="rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 py-3 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={ordersState.resetForm}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={!hasProducts}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create Order
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
                  aria-labelledby="size-picker-title"
                  onMouseDown={(event) => event.stopPropagation()}
                  className="max-h-[calc(100vh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.8)] sm:max-h-[calc(100vh-3rem)] sm:rounded-3xl sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
                        Size
                      </p>
                      <h4
                        id="size-picker-title"
                        className="mt-2 text-xl font-black text-[#FFF8E7] sm:text-2xl"
                      >
                        Choose a size
                      </h4>
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
                    {availableSizes.map((size) => {
                      const isSelected = ordersState.form.size === size

                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            ordersState.updateForm('size', size)
                            setIsSizePickerOpen(false)
                          }}
                          className={`inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border px-4 text-sm font-black uppercase tracking-[0.12em] transition focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] ${
                            isSelected
                              ? 'border-[#E4B45A]/70 bg-[#E4B45A] text-[#000000]'
                              : 'border-[#9C7A42]/45 bg-[#000000] text-[#B8A98A] hover:border-[#FDD97D] hover:text-[#FDD97D]'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </form>
        </div>
      ) : null}
    </div>
  )
}
