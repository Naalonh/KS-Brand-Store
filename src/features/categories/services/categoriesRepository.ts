import { isSupabaseConfigured } from '../../supabase/supabaseConfig'
import { supabaseFetch } from '../../supabase/supabaseFetch'
import type { Category } from '../types'

type CategoryRow = {
  active: boolean
  id: string
  name: string
  product_count: number
  slug: string
}

const categorySelect = 'id,slug,name,product_count,active'

const mapCategoryRow = (row: CategoryRow): Category => ({
  active: row.active,
  id: row.id,
  name: row.name,
  productCount: row.product_count,
  slug: row.slug,
})

const mapCategoryPayload = (category: Category) => ({
  active: category.active,
  name: category.name,
  product_count: category.productCount,
  slug: category.slug,
})

export const canUseSupabaseCategories = isSupabaseConfigured

export async function fetchCategories(accessToken?: string) {
  const rows = await supabaseFetch<CategoryRow[]>(
    `/rest/v1/categories?select=${categorySelect}&order=sort_order.asc,created_at.desc`,
    { accessToken },
  )

  return rows.map(mapCategoryRow)
}

export async function createRemoteCategory(
  category: Category,
  accessToken: string,
) {
  const rows = await supabaseFetch<CategoryRow[]>('/rest/v1/categories', {
    accessToken,
    body: mapCategoryPayload(category),
    method: 'POST',
    prefer: 'return=representation',
  })

  return mapCategoryRow(rows[0])
}

export async function updateRemoteCategory(
  categoryId: string,
  category: Category,
  accessToken: string,
) {
  const rows = await supabaseFetch<CategoryRow[]>(
    `/rest/v1/categories?id=eq.${encodeURIComponent(categoryId)}&select=${categorySelect}`,
    {
      accessToken,
      body: mapCategoryPayload(category),
      method: 'PATCH',
      prefer: 'return=representation',
    },
  )

  return mapCategoryRow(rows[0])
}

export async function deleteRemoteCategory(
  categoryId: string,
  accessToken: string,
) {
  await supabaseFetch<null>(
    `/rest/v1/categories?id=eq.${encodeURIComponent(categoryId)}`,
    {
      accessToken,
      method: 'DELETE',
      prefer: 'return=minimal',
    },
  )
}
