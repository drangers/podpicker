import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// For client-side operations
export const supabase = supabaseUrl && supabaseKey 
  ? createBrowserClient(supabaseUrl, supabaseKey)
  : null

// For server-side operations (if needed)
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key are required')
  }
  return createClient(supabaseUrl, supabaseKey)
}

export default supabase