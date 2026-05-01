import type { Order } from '../types'

const STORAGE_KEY = 'ks-brand-store-orders'

export const loadOrders = () => {
  const savedOrders = window.localStorage.getItem(STORAGE_KEY)

  if (!savedOrders) {
    return []
  }

  try {
    const parsedOrders = JSON.parse(savedOrders) as Order[]

    if (!Array.isArray(parsedOrders)) {
      return []
    }

    return parsedOrders
  } catch {
    return []
  }
}

export const saveOrders = (orders: Order[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}
