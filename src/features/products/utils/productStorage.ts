import { defaultProducts } from '../data/defaultProducts'
import type { Product } from '../types'

const STORAGE_KEY = 'ks-brand-store-products'

export const loadProducts = () => {
  const savedProducts = window.localStorage.getItem(STORAGE_KEY)

  if (!savedProducts) {
    return defaultProducts
  }

  try {
    const parsedProducts = JSON.parse(savedProducts) as Product[]

    if (!Array.isArray(parsedProducts) || parsedProducts.length === 0) {
      return defaultProducts
    }

    return parsedProducts
  } catch {
    return defaultProducts
  }
}

export const saveProducts = (products: Product[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}
