import { defaultCategories } from '../data/defaultCategories'
import type { Category } from '../types'

const STORAGE_KEY = 'ks-brand-store-categories'

const isCategoryArray = (value: unknown): value is Category[] =>
  Array.isArray(value) &&
  value.every(
    (category) =>
      typeof category === 'object' &&
      category !== null &&
      'active' in category &&
      'id' in category &&
      'name' in category &&
      'productCount' in category &&
      'slug' in category,
  )

export const loadCategories = () => {
  if (typeof window === 'undefined') {
    return defaultCategories
  }

  try {
    const savedCategories = window.localStorage.getItem(STORAGE_KEY)

    if (!savedCategories) {
      return defaultCategories
    }

    const parsedCategories: unknown = JSON.parse(savedCategories)

    return isCategoryArray(parsedCategories)
      ? parsedCategories
      : defaultCategories
  } catch {
    return defaultCategories
  }
}

export const saveCategories = (categories: Category[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
}
