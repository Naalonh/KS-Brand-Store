import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Product } from '../../products/types'
import type { Order, OrderForm, OrderStatus } from '../types'
import { loadOrders, saveOrders } from '../utils/orderStorage'

export type OrdersState = ReturnType<typeof useOrders>

export const emptyOrderForm: OrderForm = {
  customerAddress: '',
  customerName: '',
  customerPhone: '',
  note: '',
  productId: '',
  quantity: '1',
  size: '',
  status: 'pending',
}

const createOrderId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `order-${Date.now()}`
}

const createOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6)
  const randomPart = Math.random().toString(36).slice(2, 5).toUpperCase()

  return `KS-${timestamp}-${randomPart}`
}

const parsePrice = (price: string) => {
  const amount = Number.parseFloat(price.replace(/[^0-9.]/g, ''))

  return Number.isFinite(amount) ? amount : null
}

const formatTotalPrice = (unitPrice: string, quantity: number) => {
  const amount = parsePrice(unitPrice)

  if (amount === null) {
    return unitPrice
  }

  const total = amount * quantity
  const hasCents = !Number.isInteger(total)

  return `$${total.toFixed(hasCents ? 2 : 0)}`
}

const getProductOptions = (products: Product[]) => {
  const activeProducts = products.filter((product) => product.active)

  return activeProducts.length > 0 ? activeProducts : products
}

export function useOrders(products: Product[]) {
  const [orders, setOrders] = useState<Order[]>(loadOrders)
  const [form, setForm] = useState<OrderForm>(emptyOrderForm)

  const productOptions = useMemo(() => getProductOptions(products), [products])
  const selectedProduct = useMemo(
    () => productOptions.find((product) => product.id === form.productId),
    [form.productId, productOptions],
  )

  useEffect(() => {
    saveOrders(orders)
  }, [orders])

  useEffect(() => {
    if (form.productId || productOptions.length === 0) {
      return
    }

    setForm((currentForm) => ({
      ...currentForm,
      productId: productOptions[0].id,
    }))
  }, [form.productId, productOptions])

  const updateForm = (
    field: keyof OrderForm,
    value: string | OrderStatus,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setForm({
      ...emptyOrderForm,
      productId: productOptions[0]?.id ?? '',
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const quantity = Number.parseInt(form.quantity, 10)
    const product = selectedProduct

    if (
      !product ||
      !form.customerName.trim() ||
      !form.customerPhone.trim() ||
      !form.size.trim() ||
      !Number.isFinite(quantity) ||
      quantity < 1
    ) {
      return false
    }

    const nextOrder: Order = {
      customerAddress: form.customerAddress.trim(),
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      createdAt: new Date().toISOString(),
      id: createOrderId(),
      note: form.note.trim(),
      orderNumber: createOrderNumber(),
      productId: product.id,
      productName: product.name,
      quantity,
      size: form.size.trim(),
      status: form.status,
      totalPrice: formatTotalPrice(product.price, quantity),
      unitPrice: product.price,
    }

    setOrders((currentOrders) => [nextOrder, ...currentOrders])
    resetForm()
    return true
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    )
  }

  const deleteOrder = (orderId: string) => {
    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId),
    )
  }

  return {
    deleteOrder,
    form,
    handleSubmit,
    orders,
    productOptions,
    resetForm,
    selectedProduct,
    updateForm,
    updateOrderStatus,
  }
}
