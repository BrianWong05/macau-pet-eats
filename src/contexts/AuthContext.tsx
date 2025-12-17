import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'


interface AuthContextType {
  user: User | null
  session: Session | null
  isAdmin: boolean
  isLoading: boolean
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        console.log('Auth: Initializing...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        
        console.log('Auth: Session retrieved', session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)
        
        // Check JWT for admin status (Zero DB lookup)
        if (session?.user?.app_metadata?.is_admin) {
           console.log('Auth: Admin detected via JWT')
           setIsAdmin(true)
        } else {
           setIsAdmin(false)
        }
      } catch (error) {
        console.error('Auth: Initialization error:', error)
        setIsAdmin(false)
      } finally {
        console.log('Auth: Loading complete')
        setIsLoading(false)
      }
    }
    initAuth()

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        try {
          console.log('Auth: State change event', _event)
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user?.app_metadata?.is_admin) {
            console.log('Auth: Admin detected via JWT (Update)')
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
          }
        } catch (error) {
          console.error('Auth: State change error:', error)
        } finally {
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
      },
    })
    return { error }
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    // 1. Clear local state IMMEDIATELY to update UI
    console.log('Auth: Clearing local state')
    setSession(null)
    setUser(null)
    setIsAdmin(false)
    
    // 2. Attempt network sign out in background (don't await)
    try {
      console.log('Auth: Signing out network...')
      // Use a timeout race to prevent hanging
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000))
      await Promise.race([signOutPromise, timeoutPromise])
    } catch (err) {
      console.error('Auth: SignOut exception', err)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
