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
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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

const requireCategoryRow = (rows: CategoryRow[], action: string) => {
  const row = rows[0]

  if (!row) {
    throw new Error(`Supabase did not ${action} this category.`)
  }

  return row
}

const getCategoryFilter = (category: Pick<Category, 'id' | 'slug'>) =>
  uuidPattern.test(category.id)
    ? `id=eq.${encodeURIComponent(category.id)}`
    : `slug=eq.${encodeURIComponent(category.slug)}`

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

  return mapCategoryRow(requireCategoryRow(rows, 'create'))
}

export async function updateRemoteCategory(
  category: Category,
  accessToken: string,
) {
  const rows = await supabaseFetch<CategoryRow[]>(
    `/rest/v1/categories?${getCategoryFilter(category)}&select=${categorySelect}`,
    {
      accessToken,
      body: mapCategoryPayload(category),
      method: 'PATCH',
      prefer: 'return=representation',
    },
  )

  return mapCategoryRow(requireCategoryRow(rows, 'update'))
}

export async function deleteRemoteCategory(
  category: Pick<Category, 'id' | 'slug'>,
  accessToken: string,
) {
  const rows = await supabaseFetch<CategoryRow[]>(
    `/rest/v1/categories?${getCategoryFilter(category)}&select=${categorySelect}`,
    {
      accessToken,
      method: 'DELETE',
      prefer: 'return=representation',
    },
  )

  requireCategoryRow(rows, 'delete')
}
