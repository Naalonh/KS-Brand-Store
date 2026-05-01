import { defaultSizes } from '../data/defaultSizes'
import type { Size } from '../types'

const STORAGE_KEY = 'ks-brand-store-sizes'

const isSizeArray = (value: unknown): value is Size[] =>
  Array.isArray(value) &&
  value.every(
    (size) =>
      typeof size === 'object' &&
      size !== null &&
      'active' in size &&
      'id' in size &&
      'name' in size,
  )

export const loadSizes = () => {
  if (typeof window === 'undefined') {
    return defaultSizes
  }

  try {
    const savedSizes = window.localStorage.getItem(STORAGE_KEY)

    if (!savedSizes) {
      return defaultSizes
    }

    const parsedSizes: unknown = JSON.parse(savedSizes)

    return isSizeArray(parsedSizes) ? parsedSizes : defaultSizes
  } catch {
    return defaultSizes
  }
}

export const saveSizes = (sizes: Size[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes))
}
