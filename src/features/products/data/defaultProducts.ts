import type { Product, ProductForm } from '../types'

export const defaultProducts: Product[] = [
  {
    id: 'noir-runner',
    name: 'Noir Runner',
    price: '$129',
    sizes: 'EU 39-45',
    tag: 'Premium sneaker',
    active: true,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'aurum-court',
    name: 'Aurum Court',
    price: '$148',
    sizes: 'EU 38-44',
    tag: 'Leather court shoe',
    active: true,
    image:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'monarch-low',
    name: 'Monarch Low',
    price: '$156',
    sizes: 'EU 40-46',
    tag: 'Minimal luxury fit',
    active: true,
    image:
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80',
  },
]

export const emptyProductForm: ProductForm = {
  name: '',
  price: '',
  discountPrice: '',
  sizes: '',
  tag: '',
  image: '',
  active: true,
}
