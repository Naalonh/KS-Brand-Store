import type { Product } from '../products/types'

export type CartItem = {
  image: string
  name: string
  price: string
  productId: string
  quantity: number
  size: string
}

const cartStorageKey = 'ks-brand-store-cart'

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
    typeof cartItem.quantity === 'number'
  )
}

export const loadCartItems = () => {
  try {
    const storedCart = window.localStorage.getItem(cartStorageKey)

    if (!storedCart) {
      return []
    }

    const cartItems = JSON.parse(storedCart) as unknown

    return Array.isArray(cartItems) ? cartItems.filter(isCartItem) : []
  } catch {
    return []
  }
}

export const saveCartItems = (cartItems: CartItem[]) => {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems))
}

export const createCartItem = (
  product: Product,
  quantity: number,
  size: string,
): CartItem => ({
  image: product.image,
  name: product.name,
  price: product.discountPrice?.trim() || product.price,
  productId: product.id,
  quantity,
  size,
})
