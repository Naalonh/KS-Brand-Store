export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled'

export type OrderItem = {
  id: string
  productId: string
  productImage: string
  productName: string
  quantity: number
  size: string
  totalPrice: string
  unitPrice: string
}

export type Order = {
  id: string
  orderNumber: string
  customerAddress: string
  customerName: string
  customerPhone: string
  createdAt: string
  items: OrderItem[]
  note: string
  status: OrderStatus
  totalPrice: string
}

export type OrderShareStatus = 'shared' | 'converted'

export type OrderShare = {
  id: string
  convertedOrderId: string | null
  createdAt: string
  items: Array<{
    image: string
    name: string
    price: string
    productId: string
    quantity: number
    size: string
  }>
  status: OrderShareStatus
  totalPrice: string
}
