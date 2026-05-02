import { useCallback, useEffect, useState } from 'react'
import {
  canUseSupabaseOrders,
  createManualOrder,
  deleteRemoteOrder,
  fetchOrders,
  updateRemoteOrderStatus,
} from '../services/ordersRepository'
import type { CreateManualOrderInput } from '../services/ordersRepository'
import type { Order, OrderStatus } from '../types'

export type OrdersState = ReturnType<typeof useOrders>

export function useOrders(accessToken: string) {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])

  const refreshOrders = useCallback(async () => {
    if (!accessToken || !canUseSupabaseOrders) {
      setOrders([])
      return
    }

    setIsLoading(true)
    setError('')

    try {
      setOrders(await fetchOrders(accessToken))
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not load orders.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    void refreshOrders()
  }, [refreshOrders])

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const order = orders.find((currentOrder) => currentOrder.id === orderId)

    if (!order || order.status === status || !accessToken) {
      return false
    }

    await updateRemoteOrderStatus(orderId, status, accessToken)
    setOrders((currentOrders) =>
      currentOrders.map((currentOrder) =>
        currentOrder.id === orderId
          ? { ...currentOrder, status }
          : currentOrder,
      ),
    )
    return true
  }

  const deleteOrder = async (orderId: string) => {
    const order = orders.find((currentOrder) => currentOrder.id === orderId)

    if (!order || !accessToken) {
      return false
    }

    await deleteRemoteOrder(orderId, accessToken)
    setOrders((currentOrders) =>
      currentOrders.filter((currentOrder) => currentOrder.id !== orderId),
    )
    return true
  }

  const createOrder = async (input: CreateManualOrderInput) => {
    if (!accessToken) {
      return null
    }

    const createdOrder = await createManualOrder(input, accessToken)
    await refreshOrders()
    return createdOrder
  }

  return {
    createOrder,
    deleteOrder,
    error,
    isLoading,
    orders,
    refreshOrders,
    updateOrderStatus,
  }
}
