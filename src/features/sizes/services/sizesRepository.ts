import { isSupabaseConfigured } from '../../supabase/supabaseConfig'
import { supabaseFetch } from '../../supabase/supabaseFetch'
import type { Size } from '../types'

type SizeRow = {
  active: boolean
  id: string
  name: string
}

type LegacySizeRow = {
  active: boolean
  id: string
  size_label: string
}

const sizeSelect = 'id,name,active'
const legacySizeSelect = 'id,size_label,active'

const isLegacySizeSchemaError = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes('sizes.name') ||
    error.message.includes("Could not find the 'name' column"))

const mapSizeRow = (row: SizeRow): Size => ({
  active: row.active,
  id: row.id,
  name: row.name,
})

const mapLegacySizeRow = (row: LegacySizeRow): Size => ({
  active: row.active,
  id: row.id,
  name: row.size_label,
})

const uniqueSizesByName = (sizes: Size[]) => {
  const seenSizes = new Set<string>()

  return sizes.filter((size) => {
    const normalizedName = size.name.trim().toLowerCase()

    if (seenSizes.has(normalizedName)) {
      return false
    }

    seenSizes.add(normalizedName)
    return true
  })
}

const mapSizePayload = (size: Size) => ({
  active: size.active,
  name: size.name,
})

const mapLegacySizePayload = (size: Size) => ({
  active: size.active,
  group_key: 'sizes',
  group_label: 'Sizes',
  group_sort_order: 0,
  size_label: size.name,
  sort_order: 0,
})

export const canUseSupabaseSizes = isSupabaseConfigured

export async function fetchSizes(accessToken?: string) {
  try {
    const rows = await supabaseFetch<SizeRow[]>(
      `/rest/v1/sizes?select=${sizeSelect}&order=sort_order.asc,created_at.desc`,
      { accessToken },
    )

    return rows.map(mapSizeRow)
  } catch (error) {
    if (!isLegacySizeSchemaError(error)) {
      throw error
    }

    const rows = await supabaseFetch<LegacySizeRow[]>(
      `/rest/v1/sizes?select=${legacySizeSelect}&order=sort_order.asc,created_at.desc`,
      { accessToken },
    )

    return uniqueSizesByName(rows.map(mapLegacySizeRow))
  }
}

export async function createRemoteSize(size: Size, accessToken: string) {
  try {
    const rows = await supabaseFetch<SizeRow[]>('/rest/v1/sizes', {
      accessToken,
      body: mapSizePayload(size),
      method: 'POST',
      prefer: 'return=representation',
    })

    return mapSizeRow(rows[0])
  } catch (error) {
    if (!isLegacySizeSchemaError(error)) {
      throw error
    }

    const rows = await supabaseFetch<LegacySizeRow[]>('/rest/v1/sizes', {
      accessToken,
      body: mapLegacySizePayload(size),
      method: 'POST',
      prefer: 'return=representation',
    })

    return mapLegacySizeRow(rows[0])
  }
}

export async function updateRemoteSize(
  sizeId: string,
  size: Size,
  accessToken: string,
) {
  try {
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
  } catch (error) {
    if (!isLegacySizeSchemaError(error)) {
      throw error
    }

    const rows = await supabaseFetch<LegacySizeRow[]>(
      `/rest/v1/sizes?size_label=eq.${encodeURIComponent(size.name)}&select=${legacySizeSelect}`,
      {
        accessToken,
        body: {
          active: size.active,
          size_label: size.name,
        },
        method: 'PATCH',
        prefer: 'return=representation',
      },
    )

    return mapLegacySizeRow(rows[0])
  }
}

export async function deleteRemoteSize(size: Size, accessToken: string) {
  try {
    await supabaseFetch<null>(
      `/rest/v1/sizes?id=eq.${encodeURIComponent(size.id)}`,
      {
        accessToken,
        method: 'DELETE',
        prefer: 'return=minimal',
      },
    )
  } catch (error) {
    if (!isLegacySizeSchemaError(error)) {
      throw error
    }

    await supabaseFetch<null>(
      `/rest/v1/sizes?size_label=eq.${encodeURIComponent(size.name)}`,
      {
        accessToken,
        method: 'DELETE',
        prefer: 'return=minimal',
      },
    )
  }
}
