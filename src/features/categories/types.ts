export type Category = {
  active: boolean
  id: string
  name: string
  productCount: number
  slug: string
}

export type CategoryForm = Pick<Category, 'active' | 'name'>
