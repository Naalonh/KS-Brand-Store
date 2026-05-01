export type Product = {
  id: string
  name: string
  price: string
  sizes: string
  tag: string
  image: string
  active: boolean
}

export type ProductForm = Omit<Product, 'id'>
