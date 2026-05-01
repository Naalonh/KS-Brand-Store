export const supabaseConfig = {
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  url: import.meta.env.VITE_SUPABASE_URL ?? '',
}

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey,
)

export const getSupabaseHeaders = (accessToken?: string) => ({
  apikey: supabaseConfig.anonKey,
  Authorization: `Bearer ${accessToken ?? supabaseConfig.anonKey}`,
  'Content-Type': 'application/json',
})
