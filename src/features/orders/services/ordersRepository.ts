import type { CartItem } from '../../cart/cartStorage'
import { uuidPattern } from '../../products/services/productsRepository'
import { isSupabaseConfigured } from '../../supabase/supabaseConfig'
import { supabaseFetch } from '../../supabase/supabaseFetch'
import type { Order, OrderItem, OrderShare, OrderStatus } from '../types'

type OrderRow = {
  created_at: string
  customer_address: string
  customer_name: string
  customer_phone: string
  id: string
  note: string
  order_items?: OrderItemRow[]
  order_number: string
  status: OrderStatus
  total_price_label: string
}

type OrderItemRow = {
  id: string
  product_id: string | null
  product_image: string
  product_name: string
  quantity: number
  size: string
  total_price_label: string
  unit_price_label: string
}

type OrderShareRow = {
  converted_order_id: string | null
  created_at: string
  id: string
  items: unknown
  status: 'shared' | 'converted'
  total_price_label: string
}

export type CreateManualOrderItem = {
  productImage: string
  productName: string
  quantity: number
  size: string
  unitPrice: number
}

export type CreateManualOrderInput = {
  customerAddress: string
  customerName: string
  customerPhone: string
  items: CreateManualOrderItem[]
  note: string
}

const orderSelect =
  'id,order_number,customer_name,customer_phone,customer_address,note,status,total_price_label,created_at,order_items(id,product_id,product_name,product_image,size,quantity,unit_price_label,total_price_label)'

const getId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const getOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6)
  const randomPart = Math.random().toString(36).slice(2, 5).toUpperCase()

  return `KS-${timestamp}-${randomPart}`
}

const getPriceValue = (price: string) => {
  const value = Number(price.replace(/[^0-9.]/g, ''))

  return Number.isFinite(value) ? value : 0
}

const formatPrice = (value: number) => `${Number(value.toFixed(2))}$`

const isCartItem = (item: unknown): item is CartItem => {
  if (!item || typeof item !== 'object') {
    return false
  }

  const cartItem = item as CartItem

  return (
    typeof cartItem.productId === 'string' &&
    typeof cartItem.name === 'string' &&
    typeof cartItem.price === 'string' &&
    typeof cartItem.image === 'string' &&
    typeof cartItem.size === 'string' &&
    typeof cartItem.quantity === 'number' &&
    cartItem.quantity > 0
  )
}

const getShareItems = (items: CartItem[]) =>
  items.map((item) => ({
    image: item.image,
    name: item.name,
    price: item.price,
    productId: item.productId,
    quantity: item.quantity,
    size: item.size,
  }))

const mapOrderItemRow = (row: OrderItemRow): OrderItem => ({
  id: row.id,
  productId: row.product_id ?? '',
  productImage: row.product_image,
  productName: row.product_name,
  quantity: row.quantity,
  size: row.size,
  totalPrice: row.total_price_label,
  unitPrice: row.unit_price_label,
})

const mapOrderRow = (row: OrderRow): Order => ({
  createdAt: row.created_at,
  customerAddress: row.customer_address,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  id: row.id,
  items: (row.order_items ?? []).map(mapOrderItemRow),
  note: row.note,
  orderNumber: row.order_number,
  status: row.status,
  totalPrice: row.total_price_label,
})

const mapOrderShareRow = (row: OrderShareRow): OrderShare => ({
  convertedOrderId: row.converted_order_id,
  createdAt: row.created_at,
  id: row.id,
  items: Array.isArray(row.items) ? row.items.filter(isCartItem) : [],
  status: row.status,
  totalPrice: row.total_price_label,
})

export const canUseSupabaseOrders = isSupabaseConfigured

export async function createOrderShare(cartItems: CartItem[]) {
  if (cartItems.length === 0) {
    throw new Error('Cart is empty.')
  }

  const shareId = getId()
  const total = cartItems.reduce(
    (sum, item) => sum + getPriceValue(item.price) * item.quantity,
    0,
  )

  await supabaseFetch('/rest/v1/order_shares', {
    body: {
      id: shareId,
      items: getShareItems(cartItems),
      status: 'shared',
      total_price: total,
      total_price_label: formatPrice(total),
    },
    method: 'POST',
    prefer: 'return=minimal',
  })

  return {
    id: shareId,
    totalPrice: formatPrice(total),
  }
}

export async function createCartOrder(
  cartItems: CartItem[],
  accessToken?: string,
) {
  if (cartItems.length === 0) {
    throw new Error('Cart is empty.')
  }

  const orderId = getId()
  const orderNumber = getOrderNumber()
  const total = cartItems.reduce(
    (sum, item) => sum + getPriceValue(item.price) * item.quantity,
    0,
  )

  await supabaseFetch('/rest/v1/orders', {
    accessToken,
    body: {
      id: orderId,
      order_number: orderNumber,
      status: 'pending',
      total_price: total,
      total_price_label: formatPrice(total),
    },
    method: 'POST',
    prefer: 'return=minimal',
  })

  await supabaseFetch('/rest/v1/order_items', {
    accessToken,
    body: cartItems.map((item) => {
      const unitPrice = getPriceValue(item.price)
      const itemTotal = unitPrice * item.quantity

      return {
        order_id: orderId,
        product_id: uuidPattern.test(item.productId) ? item.productId : null,
        product_image: item.image,
        product_name: item.name,
        quantity: item.quantity,
        size: item.size,
        total_price: itemTotal,
        total_price_label: formatPrice(itemTotal),
        unit_price: unitPrice,
        unit_price_label: formatPrice(unitPrice),
      }
    }),
    method: 'POST',
    prefer: 'return=minimal',
  })

  return {
    id: orderId,
    orderNumber,
    totalPrice: formatPrice(total),
  }
}

export async function createManualOrder(
  input: CreateManualOrderInput,
  accessToken: string,
) {
  const validItems = input.items.filter(
    (item) =>
      item.productName.trim() &&
      item.productImage.trim() &&
      item.quantity > 0 &&
      item.unitPrice >= 0,
  )

  if (validItems.length === 0) {
    throw new Error('Add at least one product before creating an order.')
  }

  const orderId = getId()
  const orderNumber = getOrderNumber()
  const total = validItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  await supabaseFetch('/rest/v1/orders', {
    accessToken,
    body: {
      customer_address: input.customerAddress.trim(),
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone.trim(),
      id: orderId,
      note: input.note.trim(),
      order_number: orderNumber,
      status: 'pending',
      total_price: total,
      total_price_label: formatPrice(total),
    },
    method: 'POST',
    prefer: 'return=minimal',
  })

  await supabaseFetch('/rest/v1/order_items', {
    accessToken,
    body: validItems.map((item) => {
      const itemTotal = item.unitPrice * item.quantity

      return {
        order_id: orderId,
        product_id: null,
        product_image: item.productImage.trim(),
        product_name: item.productName.trim(),
        quantity: item.quantity,
        size: item.size.trim(),
        total_price: itemTotal,
        total_price_label: formatPrice(itemTotal),
        unit_price: item.unitPrice,
        unit_price_label: formatPrice(item.unitPrice),
      }
    }),
    method: 'POST',
    prefer: 'return=minimal',
  })

  return {
    id: orderId,
    orderNumber,
    totalPrice: formatPrice(total),
  }
}

export async function fetchOrderShare(shareId: string, accessToken: string) {
  const rows = await supabaseFetch<OrderShareRow[]>(
    `/rest/v1/order_shares?id=eq.${encodeURIComponent(
      shareId,
    )}&select=id,items,status,converted_order_id,total_price_label,created_at&limit=1`,
    { accessToken },
  )
  const orderShare = rows[0]

  if (!orderShare) {
    throw new Error('Shared order link was not found.')
  }

  const mappedOrderShare = mapOrderShareRow(orderShare)

  if (mappedOrderShare.items.length === 0) {
    throw new Error('Shared order has no products.')
  }

  return mappedOrderShare
}

export async function markOrderShareConverted(
  shareId: string,
  orderId: string,
  accessToken: string,
) {
  await supabaseFetch(
    `/rest/v1/order_shares?id=eq.${encodeURIComponent(shareId)}`,
    {
      accessToken,
      body: {
        converted_order_id: orderId,
        status: 'converted',
      },
      method: 'PATCH',
      prefer: 'return=minimal',
    },
  )
}

export async function fetchOrders(accessToken: string) {
  const rows = await supabaseFetch<OrderRow[]>(
    `/rest/v1/orders?select=${orderSelect}&order=created_at.desc`,
    { accessToken },
  )

  return rows.map(mapOrderRow)
}

export async function updateRemoteOrderStatus(
  orderId: string,
  status: OrderStatus,
  accessToken: string,
) {
  await supabaseFetch(
    `/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
    {
      accessToken,
      body: { status },
      method: 'PATCH',
      prefer: 'return=minimal',
    },
  )
}

export async function deleteRemoteOrder(orderId: string, accessToken: string) {
  await supabaseFetch(
    `/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
    {
      accessToken,
      method: 'DELETE',
      prefer: 'return=minimal',
    },
  )
}
