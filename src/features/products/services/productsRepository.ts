import { isSupabaseConfigured } from '../../supabase/supabaseConfig'
import { supabaseFetch } from '../../supabase/supabaseFetch'
import type { Product, ProductForm } from '../types'

type ProductRow = {
  active: boolean
  id: string
  image_url: string
  name: string
  price: string
  sizes: string
  tag: string
}

const productSelect = 'id,name,price,sizes,tag,image_url,active'

const mapProductRow = (row: ProductRow): Product => ({
  active: row.active,
  id: row.id,
  image: row.image_url,
  name: row.name,
  price: row.price,
  sizes: row.sizes,
  tag: row.tag,
})

const mapProductForm = (product: ProductForm) => ({
  active: product.active,
  image_url: product.image,
  name: product.name,
  price: product.price,
  sizes: product.sizes,
  tag: product.tag,
})

export const canUseSupabaseProducts = isSupabaseConfigured

export async function fetchProducts(accessToken?: string) {
  const rows = await supabaseFetch<ProductRow[]>(
    `/rest/v1/products?select=${productSelect}&order=sort_order.asc,created_at.desc`,
    { accessToken },
  )

  return rows.map(mapProductRow)
}

export async function createRemoteProduct(
  product: ProductForm,
  accessToken: string,
) {
  const rows = await supabaseFetch<ProductRow[]>('/rest/v1/products', {
    accessToken,
    body: mapProductForm(product),
    method: 'POST',
    prefer: 'return=representation',
  })

  return mapProductRow(rows[0])
}

export async function updateRemoteProduct(
  productId: string,
  product: ProductForm,
  accessToken: string,
) {
  const rows = await supabaseFetch<ProductRow[]>(
    `/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=${productSelect}`,
    {
      accessToken,
      body: mapProductForm(product),
      method: 'PATCH',
      prefer: 'return=representation',
    },
  )

  return mapProductRow(rows[0])
}

export async function deleteRemoteProduct(productId: string, accessToken: string) {
  await supabaseFetch<null>(
    `/rest/v1/products?id=eq.${encodeURIComponent(productId)}`,
    {
      accessToken,
      method: 'DELETE',
      prefer: 'return=minimal',
    },
  )
}
