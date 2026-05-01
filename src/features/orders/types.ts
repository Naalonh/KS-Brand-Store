export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled'

export type Order = {
  id: string
  orderNumber: string
  customerAddress: string
  customerName: string
  customerPhone: string
  createdAt: string
  note: string
  productId: string
  productName: string
  quantity: number
  size: string
  status: OrderStatus
  totalPrice: string
  unitPrice: string
}

export type OrderForm = {
  customerAddress: string
  customerName: string
  customerPhone: string
  note: string
  productId: string
  quantity: string
  size: string
  status: OrderStatus
}
