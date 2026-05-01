import type { Category, CategoryForm } from '../types'

export const defaultCategories: Category[] = [
  {
    active: true,
    id: 'new-arrivals',
    name: 'New Arrivals',
    productCount: 3,
    slug: 'new-arrivals',
  },
  {
    active: true,
    id: 'sneakers',
    name: 'Sneakers',
    productCount: 2,
    slug: 'sneakers',
  },
  {
    active: true,
    id: 'court-shoes',
    name: 'Court Shoes',
    productCount: 1,
    slug: 'court-shoes',
  },
  {
    active: false,
    id: 'limited-drops',
    name: 'Limited Drops',
    productCount: 0,
    slug: 'limited-drops',
  },
]

export const emptyCategoryForm: CategoryForm = {
  name: '',
}
