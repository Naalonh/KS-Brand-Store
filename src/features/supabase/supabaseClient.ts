import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabaseConfig } from './supabaseConfig'

const authConfig = {
  autoRefreshToken: false,
  detectSessionInUrl: false,
  persistSession: false,
}

export const supabaseClient = isSupabaseConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: authConfig,
    })
  : null

export const createSupabaseClientWithToken = (accessToken: string) =>
  isSupabaseConfigured
    ? createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        accessToken: async () => accessToken,
      })
    : null
