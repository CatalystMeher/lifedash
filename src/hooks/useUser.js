import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error('Error getting user:', error)
        setError(error)
      }
      setUser(user || null)
      setLoading(false)
    }).catch(err => {
      console.error('Error in getUser:', err)
      setError(err)
      setLoading(false)
    })
    
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null)
    })
    
    return () => sub.subscription.unsubscribe()
  }, [])

  return { user, loading, error }
}
