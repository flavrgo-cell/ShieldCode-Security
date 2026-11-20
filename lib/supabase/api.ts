import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''
  if (!url || !anonKey) return false
  if (
    url.includes('placeholder.supabase.co') ||
    url.includes('your-project-id') ||
    anonKey.includes('your-supabase-anon-key') ||
    anonKey === 'placeholder-anon-key'
  ) {
    return false
  }
  return url.startsWith('https://') || url.startsWith('http://')
}

export function getServerSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
  )
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Backward-compatible helper for API routes
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-anon-key'
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
