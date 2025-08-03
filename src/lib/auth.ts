import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthError {
  message: string
}

export interface AuthResponse {
  user?: User | null
  error?: AuthError | null
}

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } }
    }

    // Determine the correct redirect URL based on environment
    const isProduction = process.env.NODE_ENV === 'production'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const redirectUrl = isProduction 
      ? `${siteUrl}/auth/callback`
      : `${window.location.origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      return { error: { message: error.message } }
    }

    return { user: null }
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    }
  }
}

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<AuthResponse> => {
  try {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } }
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: { message: error.message } }
    }

    return { user: null }
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    }
  }
}

/**
 * Get the current user
 */
export const getUser = async (): Promise<User | null> => {
  try {
    if (!supabase) {
      return null
    }

    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
  
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}