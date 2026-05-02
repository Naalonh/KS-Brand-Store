import { useCallback, useEffect, useRef, useState } from 'react'
import { useOrders } from '../../orders/hooks/useOrders'
import {
  createCartOrder,
  fetchOrderShare,
  markOrderShareConverted,
} from '../../orders/services/ordersRepository'
import type { CreateManualOrderItem } from '../../orders/services/ordersRepository'
import type { Order, OrderShare, OrderStatus } from '../../orders/types'
import { useToast } from '../../../shared/toast/useToast'
import { AdminSummaryCard, type AdminSummaryIcon } from './AdminSummaryCard'

type OrdersPanelProps = {
  accessToken: string
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

const getOrderStatusLabel = (value: OrderStatus) =>
  orderStatuses.find((status) => status.value === value)?.label ?? value

const formatOrderDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))

const getPriceValue = (price: string) => {
  const value = Number(price.replace(/[^0-9.]/g, ''))

  return Number.isFinite(value) ? value : 0
}

const formatTotalPrice = (value: number) => `${Number(value.toFixed(2))}$`

const getBlankOrderItem = (): CreateManualOrderItem => ({
  productImage: '',
  productName: '',
  quantity: 1,
  size: '',
  unitPrice: 0,
})

const getShareIdFromText = (value: string) => {
  const shareIdMatch = value.match(
    /(?:shareId=|shareId%3D)([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i,
  )

  return shareIdMatch?.[1] ?? ''
}

const buildOrderMessage = (order: Order) => {
  const productLines = order.items
    .map((item, index) =>
      [
        `Product ${index + 1}`,
        `Product image : ${item.productImage}`,
        `product name : ${item.productName}`,
        `size : ${item.size || 'Confirm in chat'}`,
        `qty : ${item.quantity}`,
        `price : ${item.totalPrice}`,
      ].join('\n'),
    )
    .join('\n\n')

  return `Hello Bong, This is my order\nOrder : ${order.orderNumber}\n${productLines}\n\nTotal : ${order.totalPrice}`
}

export function OrdersPanel({ accessToken }: OrdersPanelProps) {
  const { showToast } = useToast()
  const ordersState = useOrders(accessToken)
  const manualShareInputRef = useRef<HTMLInputElement>(null)
  const searchParams = new URLSearchParams(window.location.search)
  const selectedOrderNumber = searchParams.get('order')
  const selectedOrderId = searchParams.get('orderId')
  const selectedShareId = searchParams.get('shareId')
  const [orderShare, setOrderShare] = useState<OrderShare | null>(null)
  const [isShareOrderOpen, setIsShareOrderOpen] = useState(false)
  const [isLoadingShareOrder, setIsLoadingShareOrder] = useState(false)
  const [isCreatingShareOrder, setIsCreatingShareOrder] = useState(false)
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [viewingOrderId, setViewingOrderId] = useState('')
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false)
  const [isLoadingManualShare, setIsLoadingManualShare] = useState(false)
  const [manualShareUrl, setManualShareUrl] = useState('')
  const [manualShareId, setManualShareId] = useState('')
  const [manualCustomerName, setManualCustomerName] = useState('')
  const [manualCustomerPhone, setManualCustomerPhone] = useState('')
  const [manualCustomerAddress, setManualCustomerAddress] = useState('')
  const [manualNote, setManualNote] = useState('')
  const [manualItems, setManualItems] = useState<CreateManualOrderItem[]>([
    getBlankOrderItem(),
  ])
  const visibleOrders = selectedOrderNumber || selectedOrderId
    ? [...ordersState.orders].sort((firstOrder, secondOrder) => {
        const isFirstSelected =
          firstOrder.orderNumber === selectedOrderNumber ||
          firstOrder.id === selectedOrderId
        const isSecondSelected =
          secondOrder.orderNumber === selectedOrderNumber ||
          secondOrder.id === selectedOrderId

        if (isFirstSelected) {
          return -1
        }

        if (isSecondSelected) {
          return 1
        }

        return 0
      })
    : ordersState.orders
  const viewingOrder =
    ordersState.orders.find((order) => order.id === viewingOrderId) ?? null
  const orderSummaryCards = [
    {
      icon: 'order',
      label: 'Total Orders',
      value: ordersState.orders.length,
    },
    {
      icon: 'archive',
      label: 'Pending',
      value: ordersState.orders.filter((order) => order.status === 'pending')
        .length,
    },
    {
      icon: 'active',
      label: 'Paid',
      value: ordersState.orders.filter((order) => order.status === 'paid')
        .length,
    },
    {
      icon: 'product',
      label: 'Fulfilled',
      value: ordersState.orders.filter((order) => order.status === 'fulfilled')
        .length,
    },
    {
      icon: 'hidden',
      label: 'Cancelled',
      value: ordersState.orders.filter((order) => order.status === 'cancelled')
        .length,
    },
    {
      icon: 'revenue',
      label: 'Revenue',
      value: formatTotalPrice(
        ordersState.orders
          .filter((order) => order.status !== 'cancelled')
          .reduce((total, order) => total + getPriceValue(order.totalPrice), 0),
      ),
    },
  ] satisfies Array<{
    icon: AdminSummaryIcon
    label: string
    value: number | string
  }>

  const replaceShareUrlWithOrder = useCallback((orderId?: string) => {
    const nextParams = new URLSearchParams(window.location.search)

    nextParams.delete('shareId')

    if (orderId) {
      nextParams.set('orderId', orderId)
    }

    const nextSearch = nextParams.toString()

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`,
    )
  }, [])

  useEffect(() => {
    if (!selectedShareId || !accessToken) {
      return
    }

    let isMounted = true

    const loadOrderShare = async () => {
      setIsLoadingShareOrder(true)

      try {
        const nextOrderShare = await fetchOrderShare(
          selectedShareId,
          accessToken,
        )

        if (!isMounted) {
          return
        }

        setOrderShare(nextOrderShare)

        if (
          nextOrderShare.status === 'converted' &&
          nextOrderShare.convertedOrderId
        ) {
          replaceShareUrlWithOrder(nextOrderShare.convertedOrderId)
          showToast({
            message: 'This shared order was already created.',
            tone: 'warning',
          })
          return
        }

        setIsShareOrderOpen(true)
      } catch (caughtError) {
        if (!isMounted) {
          return
        }

        setOrderShare(null)
        showToast({
          message:
            caughtError instanceof Error
              ? caughtError.message
              : 'Could not load shared order.',
          tone: 'error',
        })
      } finally {
        if (isMounted) {
          setIsLoadingShareOrder(false)
        }
      }
    }

    void loadOrderShare()

    return () => {
      isMounted = false
    }
  }, [accessToken, replaceShareUrlWithOrder, selectedShareId, showToast])

  const closeShareOrder = () => {
    setIsShareOrderOpen(false)
    replaceShareUrlWithOrder()
  }

  const resetCreateOrderForm = () => {
    setManualShareUrl('')
    setManualShareId('')
    setManualCustomerName('')
    setManualCustomerPhone('')
    setManualCustomerAddress('')
    setManualNote('')
    setManualItems([getBlankOrderItem()])
  }

  const closeCreateOrder = () => {
    if (isCreatingOrder) {
      return
    }

    setIsCreateOrderOpen(false)
    resetCreateOrderForm()
  }

  const updateManualItem = (
    index: number,
    field: keyof CreateManualOrderItem,
    value: string,
  ) => {
    setManualItems((currentItems) =>
      currentItems.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item
        }

        if (field === 'quantity') {
          return { ...item, quantity: Math.max(1, Number(value) || 1) }
        }

        if (field === 'unitPrice') {
          return { ...item, unitPrice: Math.max(0, Number(value) || 0) }
        }

        return { ...item, [field]: value }
      }),
    )
  }

  const removeManualItem = (index: number) => {
    setManualItems((currentItems) =>
      currentItems.length === 1
        ? [getBlankOrderItem()]
        : currentItems.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  const fillManualOrderFromShare = async (value: string) => {
    const shareId = getShareIdFromText(value)

    if (!shareId || shareId === manualShareId || isLoadingManualShare) {
      return
    }

    setIsLoadingManualShare(true)

    try {
      const nextOrderShare = await fetchOrderShare(shareId, accessToken)

      if (
        nextOrderShare.status === 'converted' &&
        nextOrderShare.convertedOrderId
      ) {
        showToast({
          message: 'This shared order was already created.',
          tone: 'warning',
        })
        return
      }

      setManualShareId(nextOrderShare.id)
      setManualItems(
        nextOrderShare.items.map((item) => ({
          productImage: item.image,
          productName: item.name,
          quantity: item.quantity,
          size: item.size,
          unitPrice: getPriceValue(item.price),
        })),
      )
      showToast({
        message: 'Shared order info was filled.',
        tone: 'success',
      })
    } catch (caughtError) {
      showToast({
        message:
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not load shared order.',
        tone: 'error',
      })
    } finally {
      setIsLoadingManualShare(false)
    }
  }

  const pasteManualShareUrl = async () => {
    manualShareInputRef.current?.focus()

    try {
      let nextValue = ''

      if (navigator.clipboard?.readText) {
        nextValue = await navigator.clipboard.readText()
      }

      if (!nextValue && navigator.clipboard?.read) {
        const clipboardItems = await navigator.clipboard.read()
        const textItem = clipboardItems.find((item) =>
          item.types.includes('text/plain'),
        )

        if (textItem) {
          const textBlob = await textItem.getType('text/plain')

          nextValue = await textBlob.text()
        }
      }

      if (!nextValue.trim()) {
        showToast({
          message: 'Clipboard is empty.',
          tone: 'warning',
        })
        return
      }

      setManualShareUrl(nextValue)
      await fillManualOrderFromShare(nextValue)
    } catch {
      const didPaste = document.execCommand?.('paste') ?? false

      if (didPaste) {
        return
      }

      manualShareInputRef.current?.focus()
      showToast({
        message: 'Browser blocked auto paste. Press Ctrl+V now.',
        tone: 'warning',
      })
    }
  }

  const createManualAdminOrder = async () => {
    if (isCreatingOrder) {
      return
    }

    setIsCreatingOrder(true)

    try {
      const createdOrder = await ordersState.createOrder({
        customerAddress: manualCustomerAddress,
        customerName: manualCustomerName,
        customerPhone: manualCustomerPhone,
        items: manualItems,
        note: manualNote,
      })

      if (!createdOrder) {
        throw new Error('Could not create order.')
      }

      if (manualShareId) {
        await markOrderShareConverted(manualShareId, createdOrder.id, accessToken)
      }

      setIsCreateOrderOpen(false)
      resetCreateOrderForm()
      showToast({
        message: `Order ${createdOrder.orderNumber} was created.`,
        tone: 'success',
      })
    } catch (caughtError) {
      showToast({
        message:
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not create order.',
        tone: 'error',
      })
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const createRealOrderFromShare = async () => {
    if (!orderShare || isCreatingShareOrder) {
      return
    }

    setIsCreatingShareOrder(true)

    try {
      const createdOrder = await createCartOrder(orderShare.items, accessToken)

      await markOrderShareConverted(
        orderShare.id,
        createdOrder.id,
        accessToken,
      )
      await ordersState.refreshOrders()
      setIsShareOrderOpen(false)
      replaceShareUrlWithOrder(createdOrder.id)
      showToast({
        message: `Order ${createdOrder.orderNumber} was created.`,
        tone: 'success',
      })
    } catch (caughtError) {
      showToast({
        message:
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not create order.',
        tone: 'error',
      })
    } finally {
      setIsCreatingShareOrder(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const didUpdate = await ordersState.updateOrderStatus(orderId, status)

      if (didUpdate) {
        showToast({
          message: 'Order status was updated.',
          tone: 'success',
        })
      }
    } catch (caughtError) {
      showToast({
        message:
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not update order.',
        tone: 'error',
      })
    }
  }

  const deleteOrder = async (orderId: string) => {
    try {
      const didDelete = await ordersState.deleteOrder(orderId)

      if (didDelete) {
        showToast({
          message: 'Order was deleted.',
          tone: 'success',
        })
      }
    } catch (caughtError) {
      showToast({
        message:
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not delete order.',
        tone: 'error',
      })
    }
  }

  const copyOrder = async (order: Order) => {
    await navigator.clipboard.writeText(buildOrderMessage(order))
    showToast({
      message: 'Order message copied.',
      tone: 'success',
    })
  }

  const selectViewingOrderStatus = (status: OrderStatus) => {
    if (!viewingOrder) {
      return
    }

    setIsOrderStatusOpen(false)
    void updateOrderStatus(viewingOrder.id, status)
  }

  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {orderSummaryCards.map((card) => (
          <AdminSummaryCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
          />
        ))}
      </section>

      <section className="py-4 sm:py-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-black text-[#FFF8E7] sm:text-3xl">
              Orders
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setIsCreateOrderOpen(true)}
              className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] sm:w-auto sm:px-7 sm:tracking-[0.14em]"
            >
              Create Order
            </button>
            <button
              type="button"
              onClick={ordersState.refreshOrders}
              className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-5 text-sm font-black uppercase tracking-[0.12em] text-[#FDD97D] transition hover:border-[#FDD97D] hover:text-[#FFF8E7] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] sm:w-auto sm:px-7 sm:tracking-[0.14em]"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="p-4 sm:p-6">
        {ordersState.error ? (
          <p className="mt-4 rounded-[10px] border border-red-500/40 bg-red-950/25 p-4 text-sm font-semibold text-red-200">
            {ordersState.error}
          </p>
        ) : null}

        {ordersState.isLoading ? (
          <p className="mt-6 text-sm font-semibold text-[#B8A98A]">
            Loading orders...
          </p>
        ) : null}

        {isLoadingShareOrder ? (
          <p className="mt-4 rounded-[10px] border border-[#9C7A42]/30 bg-[#000000] p-4 text-sm font-semibold text-[#B8A98A]">
            Loading shared order...
          </p>
        ) : null}

        {!ordersState.isLoading && visibleOrders.length === 0 ? (
          <p className="mt-6 rounded-[10px] border border-[#9C7A42]/30 bg-[#000000] p-5 text-center text-sm font-semibold text-[#B8A98A]">
            No orders yet.
          </p>
        ) : null}

        {visibleOrders.length > 0 ? (
          <div className="overflow-x-auto rounded-[10px] border border-[#9C7A42]/25 bg-[#000000]">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#9C7A42]/25 bg-[#130E0D] text-xs font-black uppercase tracking-[0.16em] text-[#B8A98A]">
                  <th className="px-4 py-4">Id</th>
                  <th className="px-4 py-4">Product Name</th>
                  <th className="px-4 py-4">Size</th>
                  <th className="px-4 py-4">Qty</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((order) => {
                  const isSelectedOrder =
                    order.orderNumber === selectedOrderNumber ||
                    order.id === selectedOrderId
                  const productNames =
                    order.items.map((item) => item.productName).join(', ') ||
                    'No products'
                  const sizes =
                    order.items
                      .map((item) => item.size || 'Confirm in chat')
                      .join(', ') || 'Confirm in chat'
                  const quantity = order.items.reduce(
                    (total, item) => total + item.quantity,
                    0,
                  )

                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-[#9C7A42]/15 last:border-b-0 ${
                        isSelectedOrder ? 'bg-[#E4B45A]/10' : ''
                      }`}
                    >
                      <td className="px-4 py-4 text-sm font-black text-[#FFF8E7]">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-[#B8A98A]">
                        {productNames}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-[#B8A98A]">
                        {sizes}
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-[#FFF8E7]">
                        {quantity}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-[10px] border border-[#9C7A42]/40 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A]">
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setViewingOrderId(order.id)}
                            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-4 text-xs font-black uppercase tracking-[0.12em] text-[#FDD97D] transition hover:border-[#FDD97D] hover:text-[#FFF8E7] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000]"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {viewingOrder ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000]/75 p-4"
          onMouseDown={() => {
            setIsOrderStatusOpen(false)
            setViewingOrderId('')
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-title"
            className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-[10px] border border-[#9C7A42]/45 bg-[#130E0D] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#9C7A42]/30 px-5 py-4">
              <div>
                <p
                  id="order-detail-title"
                  className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]"
                >
                  Order Detail
                </p>
                <p className="mt-1 text-xl font-black text-[#FFF8E7]">
                  {viewingOrder.orderNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOrderStatusOpen(false)
                  setViewingOrderId('')
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E4B45A]/50 bg-[#000000] text-lg font-black text-[#FDD97D] transition hover:bg-[#2A0F0A] focus:outline-none focus:ring-2 focus:ring-[#FDD97D]"
                aria-label="Close order detail popup"
              >
                X
              </button>
            </div>

            <div className="grid gap-5 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] p-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                    Customer
                  </p>
                  <p className="mt-2 break-words text-sm font-black text-[#FFF8E7]">
                    {viewingOrder.customerName || 'Not provided'}
                  </p>
                </div>
                <div className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] p-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                    Phone
                  </p>
                  <p className="mt-2 break-words text-sm font-black text-[#FFF8E7]">
                    {viewingOrder.customerPhone || 'Not provided'}
                  </p>
                </div>
                <div className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] p-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                    Date
                  </p>
                  <p className="mt-2 break-words text-sm font-black text-[#FFF8E7]">
                    {formatOrderDate(viewingOrder.createdAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                  Address
                </p>
                <p className="mt-2 break-words text-sm font-semibold text-[#FFF8E7]">
                  {viewingOrder.customerAddress || 'Not provided'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[10rem_1fr_1fr]">
                <div
                  className="relative"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setIsOrderStatusOpen(false)
                    }
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsOrderStatusOpen((isOpen) => !isOpen)}
                    className="inline-flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-left text-xs font-black uppercase tracking-[0.08em] text-[#FFF8E7] outline-none transition hover:border-[#FDD97D] focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                    aria-haspopup="listbox"
                    aria-expanded={isOrderStatusOpen}
                    aria-label="Order status"
                  >
                    <span className="min-w-0 truncate">
                      {getOrderStatusLabel(viewingOrder.status)}
                    </span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className={`h-4 w-4 shrink-0 text-[#E4B45A] transition-transform ${
                        isOrderStatusOpen ? '' : 'rotate-180'
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
                  {isOrderStatusOpen ? (
                    <div
                      role="listbox"
                      className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
                    >
                      {orderStatuses.map((status) => (
                        <button
                          key={status.value}
                          type="button"
                          role="option"
                          aria-selected={viewingOrder.status === status.value}
                          onClick={() => selectViewingOrderStatus(status.value)}
                          className={`block min-h-11 w-full cursor-pointer px-4 text-left text-xs font-black uppercase tracking-[0.08em] transition ${
                            viewingOrder.status === status.value
                              ? 'bg-[#E4B45A] text-[#000000]'
                              : 'text-[#B8A98A] hover:bg-[#130E0D] hover:text-[#FDD97D]'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => copyOrder(viewingOrder)}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
                >
                  Copy Order
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteOrder(viewingOrder.id)
                    setViewingOrderId('')
                  }}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border border-red-500/45 px-4 text-xs font-black uppercase tracking-[0.12em] text-red-200 transition hover:border-red-300 hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-[#130E0D]"
                >
                  Delete
                </button>
              </div>

              <div className="grid gap-3">
                {viewingOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-[10px] border border-[#9C7A42]/20 bg-[#000000] p-3 sm:grid-cols-[5rem_1fr_auto]"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="aspect-square w-20 rounded-[8px] object-cover"
                    />
                    <div>
                      <p className="text-base font-black text-[#FFF8E7]">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#B8A98A]">
                        Size: {item.size || 'Confirm in chat'} - Qty:{' '}
                        {item.quantity}
                      </p>
                    </div>
                    <p className="text-right text-lg font-black text-[#E4B45A]">
                      {item.totalPrice}
                    </p>
                  </div>
                ))}
              </div>

              {viewingOrder.note ? (
                <div className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] p-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#B8A98A]">
                    Note
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm font-semibold text-[#FFF8E7]">
                    {viewingOrder.note}
                  </p>
                </div>
              ) : null}

              <div className="flex justify-end border-t border-[#9C7A42]/25 pt-4">
                <p className="text-lg font-black text-[#E4B45A]">
                  Total: {viewingOrder.totalPrice}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isShareOrderOpen && orderShare ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000]/75 p-4"
          onMouseDown={closeShareOrder}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-order-title"
            className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-[10px] border border-[#9C7A42]/45 bg-[#130E0D] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#9C7A42]/30 px-5 py-4">
              <p
                id="share-order-title"
                className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]"
              >
                Create Order
              </p>
              <button
                type="button"
                onClick={closeShareOrder}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E4B45A]/50 bg-[#000000] text-lg font-black text-[#FDD97D] transition hover:bg-[#2A0F0A] focus:outline-none focus:ring-2 focus:ring-[#FDD97D]"
                aria-label="Close shared order popup"
              >
                X
              </button>
            </div>

            <div className="grid gap-4 p-5">
              <div className="grid gap-3">
                {orderShare.items.map((item, index) => {
                  const itemTotal = getPriceValue(item.price) * item.quantity

                  return (
                    <div
                      key={`${item.productId}-${item.size}-${index}`}
                      className="grid grid-cols-[5rem_minmax(0,1fr)_auto] gap-3 rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] p-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="aspect-square w-full rounded-[8px] object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-base font-black text-[#FFF8E7]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#B8A98A]">
                          Size: {item.size || 'Confirm in chat'}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#B8A98A]">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-right text-base font-black text-[#E4B45A]">
                        {formatTotalPrice(itemTotal)}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end border-t border-[#9C7A42]/25 pt-4">
                <p className="text-lg font-black text-[#E4B45A]">
                  Total: {orderShare.totalPrice}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={closeShareOrder}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#9C7A42]/70 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createRealOrderFromShare}
                  disabled={isCreatingShareOrder}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#E4B45A] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingShareOrder ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isCreateOrderOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000]/75 p-4"
          onMouseDown={closeCreateOrder}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-order-title"
            className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-[10px] border border-[#9C7A42]/45 bg-[#130E0D] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#9C7A42]/30 px-5 py-4">
              <p
                id="manual-order-title"
                className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]"
              >
                Create Order
              </p>
              <button
                type="button"
                onClick={closeCreateOrder}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E4B45A]/50 bg-[#000000] text-lg font-black text-[#FDD97D] transition hover:bg-[#2A0F0A] focus:outline-none focus:ring-2 focus:ring-[#FDD97D]"
                aria-label="Close create order popup"
              >
                X
              </button>
            </div>

            <div className="grid gap-5 p-5">
              <label className="grid gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#E4B45A]">
                Shared Order URL
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    ref={manualShareInputRef}
                    value={manualShareUrl}
                    onChange={(event) => {
                      const nextValue = event.target.value

                      setManualShareUrl(nextValue)
                      void fillManualOrderFromShare(nextValue)
                    }}
                    onPaste={(event) => {
                      const nextValue = event.clipboardData.getData('text')

                      if (!nextValue) {
                        return
                      }

                      event.preventDefault()
                      setManualShareUrl(nextValue)
                      void fillManualOrderFromShare(nextValue)
                    }}
                    placeholder="Paste /orders?shareId=..."
                    className="min-h-11 rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] px-3 text-sm font-semibold normal-case tracking-normal text-[#FFF8E7] outline-none transition placeholder:text-[#7D6E55] focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                  />
                  <button
                    type="button"
                    onClick={() => void pasteManualShareUrl()}
                    disabled={isLoadingManualShare}
                    className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#FDD97D] transition hover:border-[#FDD97D] hover:text-[#FFF8E7] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Paste
                  </button>
                </div>
                {isLoadingManualShare ? (
                  <span className="text-xs font-semibold normal-case tracking-normal text-[#B8A98A]">
                    Loading shared order...
                  </span>
                ) : null}
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#E4B45A]">
                  Customer
                  <input
                    value={manualCustomerName}
                    onChange={(event) =>
                      setManualCustomerName(event.target.value)
                    }
                    className="min-h-11 rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] px-3 text-sm font-semibold normal-case tracking-normal text-[#FFF8E7] outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                  />
                </label>
                <label className="grid gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#E4B45A]">
                  Phone
                  <input
                    value={manualCustomerPhone}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(event) =>
                      setManualCustomerPhone(event.target.value.replace(/\D/g, ''))
                    }
                    className="min-h-11 rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] px-3 text-sm font-semibold normal-case tracking-normal text-[#FFF8E7] outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                  />
                </label>
                <label className="grid gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#E4B45A] sm:col-span-2">
                  Address
                  <input
                    value={manualCustomerAddress}
                    onChange={(event) =>
                      setManualCustomerAddress(event.target.value)
                    }
                    className="min-h-11 rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] px-3 text-sm font-semibold normal-case tracking-normal text-[#FFF8E7] outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                  />
                </label>
                <label className="grid gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#E4B45A] sm:col-span-2">
                  Note
                  <textarea
                    value={manualNote}
                    onChange={(event) => setManualNote(event.target.value)}
                    rows={3}
                    className="rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] px-3 py-3 text-sm font-semibold normal-case tracking-normal text-[#FFF8E7] outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                  />
                </label>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
                    Products
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setManualItems((currentItems) => [
                        ...currentItems,
                        getBlankOrderItem(),
                      ])
                    }
                    className="inline-flex min-h-10 items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-4 text-xs font-black uppercase tracking-[0.12em] text-[#FDD97D] transition hover:border-[#FDD97D] hover:text-[#FFF8E7] focus:outline-none focus:ring-2 focus:ring-[#FDD97D]"
                  >
                    Add Product
                  </button>
                </div>

                {manualItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-[10px] border border-[#9C7A42]/25 bg-[#000000] p-3 sm:grid-cols-[5rem_minmax(0,1fr)]"
                  >
                    <div className="flex aspect-square h-20 w-20 items-center justify-center overflow-hidden rounded-[8px] border border-[#9C7A42]/45 bg-[#130E0D]">
                      {item.productImage.trim() ? (
                        <img
                          src={item.productImage}
                          alt={item.productName || 'Product'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="px-2 text-center text-[10px] font-black uppercase tracking-[0.1em] text-[#7D6E55]">
                          Image
                        </span>
                      )}
                    </div>
                    <div className="grid min-w-0 gap-3">
                      <div className="grid gap-3">
                        <input
                          value={item.productName}
                          onChange={(event) =>
                            updateManualItem(
                              index,
                              'productName',
                              event.target.value,
                            )
                          }
                          placeholder="Product name"
                          className="min-h-11 rounded-[10px] border border-[#9C7A42]/45 bg-[#130E0D] px-3 text-sm font-semibold text-[#FFF8E7] outline-none transition placeholder:text-[#7D6E55] focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[1fr_8rem_8rem_3rem]">
                        <input
                          value={item.size}
                          onChange={(event) =>
                            updateManualItem(index, 'size', event.target.value)
                          }
                          placeholder="Size"
                          className="min-h-11 rounded-[10px] border border-[#9C7A42]/45 bg-[#130E0D] px-3 text-sm font-semibold text-[#FFF8E7] outline-none transition placeholder:text-[#7D6E55] focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateManualItem(
                              index,
                              'quantity',
                              event.target.value,
                            )
                          }
                          className="min-h-11 rounded-[10px] border border-[#9C7A42]/45 bg-[#130E0D] px-3 text-sm font-semibold text-[#FFF8E7] outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) =>
                            updateManualItem(
                              index,
                              'unitPrice',
                              event.target.value,
                            )
                          }
                          className="min-h-11 rounded-[10px] border border-[#9C7A42]/45 bg-[#130E0D] px-3 text-sm font-semibold text-[#FFF8E7] outline-none transition focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                        />
                        <button
                          type="button"
                          onClick={() => removeManualItem(index)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-red-500/45 text-red-200 transition hover:border-red-300 hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                          aria-label="Remove product"
                          title="Remove product"
                        >
                          <svg
                            aria-hidden="true"
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.25"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v5" />
                            <path d="M14 11v5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 border-t border-[#9C7A42]/25 pt-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={closeCreateOrder}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#9C7A42]/70 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createManualAdminOrder}
                  disabled={isCreatingOrder}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#E4B45A] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingOrder ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
