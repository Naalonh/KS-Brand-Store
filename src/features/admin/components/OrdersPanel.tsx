import type { ProductsState } from '../../products/hooks/useProducts'
import { useOrders } from '../../orders/hooks/useOrders'
import type { OrderStatus } from '../../orders/types'

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

export function OrdersPanel({ productsState }: OrdersPanelProps) {
  const ordersState = useOrders(productsState.products)
  const hasProducts = ordersState.productOptions.length > 0

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
              Order Management
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#FFF8E7]">
              Create order
            </h2>
          </div>
          <span className="inline-flex min-h-11 items-center rounded-[10px] border border-[#9C7A42]/45 px-4 text-sm font-black uppercase tracking-[0.12em] text-[#B8A98A]">
            {ordersState.orders.length} total
          </span>
        </div>
      </section>

      <section className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <form onSubmit={ordersState.handleSubmit} className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                Customer name
              </span>
              <input
                value={ordersState.form.customerName}
                onChange={(event) =>
                  ordersState.updateForm('customerName', event.target.value)
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
                  ordersState.updateForm('customerPhone', event.target.value)
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
                ordersState.updateForm('customerAddress', event.target.value)
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
              <input
                value={ordersState.form.size}
                onChange={(event) =>
                  ordersState.updateForm('size', event.target.value)
                }
                placeholder={ordersState.selectedProduct?.sizes ?? 'EU 42'}
                required
                className="min-h-12 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-[#FFF8E7] outline-none transition placeholder:text-[#B8A98A]/55 focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
              />
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

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
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
        </form>
      </section>

      <section className="rounded-3xl border border-[#9C7A42]/35 bg-[#130E0D] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
            Orders
          </p>
          <span className="text-sm font-semibold text-[#B8A98A]">
            {ordersState.orders.length} total
          </span>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-[#9C7A42]/25 bg-[#000000]">
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
                        ordersState.updateOrderStatus(
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
                      onClick={() => ordersState.deleteOrder(order.id)}
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
    </div>
  )
}
