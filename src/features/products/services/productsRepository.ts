import { isSupabaseConfigured } from '../../supabase/supabaseConfig'
import { supabaseFetch } from '../../supabase/supabaseFetch'
import type { Product, ProductForm } from '../types'

type ProductRow = {
  active: boolean
  discount_price?: string | null
  id: string
  image_url: string
  name: string
  price: string
  sizes: string
  tag: string
}

const productSelect = 'id,name,price,discount_price,sizes,tag,image_url,active'
const legacyProductSelect = 'id,name,price,sizes,tag,image_url,active'
export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isLegacyProductSchemaError = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes('products.discount_price') ||
    error.message.includes("Could not find the 'discount_price' column"))

const mapProductRow = (row: ProductRow): Product => ({
  active: row.active,
  discountPrice: row.discount_price ?? '',
  id: row.id,
  image: row.image_url,
  name: row.name,
  price: row.price,
  sizes: row.sizes,
  tag: row.tag,
})

const mapProductForm = (product: ProductForm) => ({
  active: product.active,
  discount_price: product.discountPrice?.trim() || null,
  image_url: product.image,
  name: product.name,
  price: product.price,
  sizes: product.sizes,
  tag: product.tag,
})

const mapLegacyProductForm = (product: ProductForm) => {
  const payload: Omit<ReturnType<typeof mapProductForm>, 'discount_price'> &
    Partial<Pick<ReturnType<typeof mapProductForm>, 'discount_price'>> =
    mapProductForm(product)

  delete payload.discount_price

  return payload
}

const requireProductRow = (rows: ProductRow[], action: string) => {
  const row = rows[0]

  if (!row) {
    throw new Error(`Supabase did not ${action} this product.`)
  }

  return row
}

export const canUseSupabaseProducts = isSupabaseConfigured

export async function fetchProducts(accessToken?: string) {
  try {
    const rows = await supabaseFetch<ProductRow[]>(
      `/rest/v1/products?select=${productSelect}&order=sort_order.asc,created_at.desc`,
      { accessToken },
    )

    return rows.map(mapProductRow)
  } catch (error) {
    if (!isLegacyProductSchemaError(error)) {
      throw error
    }

    const rows = await supabaseFetch<ProductRow[]>(
      `/rest/v1/products?select=${legacyProductSelect}&order=sort_order.asc,created_at.desc`,
      { accessToken },
    )

    return rows.map(mapProductRow)
  }
}

export async function createRemoteProduct(
  product: ProductForm,
  accessToken: string,
  productId?: string,
) {
  try {
    const rows = await supabaseFetch<ProductRow[]>('/rest/v1/products', {
      accessToken,
      body: {
        ...mapProductForm(product),
        ...(productId ? { id: productId } : {}),
      },
      method: 'POST',
      prefer: 'return=representation',
    })

    return mapProductRow(requireProductRow(rows, 'create'))
  } catch (error) {
    if (!isLegacyProductSchemaError(error)) {
      throw error
    }

    const rows = await supabaseFetch<ProductRow[]>('/rest/v1/products', {
      accessToken,
      body: {
        ...mapLegacyProductForm(product),
        ...(productId ? { id: productId } : {}),
      },
      method: 'POST',
      prefer: 'return=representation',
    })

    return mapProductRow(requireProductRow(rows, 'create'))
  }
}

export async function updateRemoteProduct(
  productId: string,
  product: ProductForm,
  accessToken: string,
) {
  try {
    const rows = await supabaseFetch<ProductRow[]>(
      `/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=${productSelect}`,
      {
        accessToken,
        body: mapProductForm(product),
        method: 'PATCH',
        prefer: 'return=representation',
      },
    )

    return mapProductRow(requireProductRow(rows, 'update'))
  } catch (error) {
    if (!isLegacyProductSchemaError(error)) {
      throw error
    }

    const rows = await supabaseFetch<ProductRow[]>(
      `/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=${legacyProductSelect}`,
      {
        accessToken,
        body: mapLegacyProductForm(product),
        method: 'PATCH',
        prefer: 'return=representation',
      },
    )

    return mapProductRow(requireProductRow(rows, 'update'))
  }
}

export async function deleteRemoteProduct(productId: string, accessToken: string) {
  const rows = await supabaseFetch<ProductRow[]>(
    `/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=${productSelect}`,
    {
      accessToken,
      method: 'DELETE',
      prefer: 'return=representation',
    },
  )

  requireProductRow(rows, 'delete')
}
