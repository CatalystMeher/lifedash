import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import useUser from './useUser'

export function useUserPreferences() {
  const { user } = useUser()
  const queryClient = useQueryClient()

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }
      
      // Return default preferences if none exist
      return data || { amount_format: 'US' }
    },
    enabled: !!user?.id
  })

  const updatePreferences = useMutation({
    mutationFn: async (updates) => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updates
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-preferences', user?.id])
    }
  })

  return {
    preferences: preferences || { amount_format: 'US' },
    isLoading,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending
  }
}

// Helper function to format numbers based on user preferences
export function formatAmount(value, format = 'US') {
  if (typeof value !== 'number' || isNaN(value)) return value.toString()
  
  if (format === 'IN') {
    // Indian formatting: 1,00,000 (lakhs)
    if (value >= 10000000) {
      return (value / 10000000).toFixed(1).replace(/\.0$/, '') + ' Cr'
    } else if (value >= 100000) {
      return (value / 100000).toFixed(1).replace(/\.0$/, '') + ' L'
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1).replace(/\.0$/, '') + ' K'
    }
    return value.toString()
  } else {
    // US formatting: 1,000,000 (millions)
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return value.toString()
  }
}
