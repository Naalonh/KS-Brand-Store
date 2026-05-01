import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabaseConfig } from './supabaseConfig'

const authConfig = {
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
        auth: authConfig,
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      })
    : null
