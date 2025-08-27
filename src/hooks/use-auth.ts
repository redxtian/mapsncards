'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { authOperations } from '@/lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authOperations.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await authOperations.signInWithEmail(email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      await authOperations.signUpWithEmail(email, password)
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      await authOperations.signInWithGoogle()
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authOperations.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  }
}