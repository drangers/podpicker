'use client'

import { useEffect, useState } from 'react'
import { User, LogOut } from 'lucide-react'
import { getUser, signOut, onAuthStateChange } from '@/lib/auth'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthNavProps {
  onSignInClick: () => void
}

export default function AuthNav({ onSignInClick }: AuthNavProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check initial auth state
    const checkUser = async () => {
      const currentUser = await getUser()
      setUser(currentUser)
      setIsLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  if (isLoading) {
    return (
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-gray-700 font-medium">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    )
  }

  return (
    <button 
      onClick={onSignInClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
    >
      Sign In
    </button>
  )
}