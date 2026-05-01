import { isSupabaseConfigured } from '../../supabase/supabaseConfig'
import { supabaseFetch } from '../../supabase/supabaseFetch'
import type { Size } from '../types'

type SizeRow = {
  active: boolean
  id: string
  name: string
}

const sizeSelect = 'id,name,active'

const mapSizeRow = (row: SizeRow): Size => ({
  active: row.active,
  id: row.id,
  name: row.name,
})

const mapSizePayload = (size: Size) => ({
  active: size.active,
  name: size.name,
})

export const canUseSupabaseSizes = isSupabaseConfigured

export async function fetchSizes(accessToken?: string) {
  const rows = await supabaseFetch<SizeRow[]>(
    `/rest/v1/sizes?select=${sizeSelect}&order=sort_order.asc,created_at.desc`,
    { accessToken },
  )

  return rows.map(mapSizeRow)
}

export async function createRemoteSize(size: Size, accessToken: string) {
  const rows = await supabaseFetch<SizeRow[]>('/rest/v1/sizes', {
    accessToken,
    body: mapSizePayload(size),
    method: 'POST',
    prefer: 'return=representation',
  })

  return mapSizeRow(rows[0])
}

export async function updateRemoteSize(
  sizeId: string,
  size: Size,
  accessToken: string,
) {
  const rows = await supabaseFetch<SizeRow[]>(
    `/rest/v1/sizes?id=eq.${encodeURIComponent(sizeId)}&select=${sizeSelect}`,
    {
      accessToken,
      body: mapSizePayload(size),
      method: 'PATCH',
      prefer: 'return=representation',
    },
  )

  return mapSizeRow(rows[0])
}

export async function deleteRemoteSize(sizeId: string, accessToken: string) {
  await supabaseFetch<null>(`/rest/v1/sizes?id=eq.${encodeURIComponent(sizeId)}`, {
    accessToken,
    method: 'DELETE',
    prefer: 'return=minimal',
  })
}
