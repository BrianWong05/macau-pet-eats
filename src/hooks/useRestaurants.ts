import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Restaurant, PetPolicy } from '@/types/database'

interface UseRestaurantsOptions {
  searchQuery?: string
  petPolicyFilter?: PetPolicy | null
  cuisineFilter?: string | null
}

interface UseRestaurantsReturn {
  restaurants: Restaurant[]
  featuredRestaurants: Restaurant[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  cuisineTypes: string[]
}

export function useRestaurants(options: UseRestaurantsOptions = {}): UseRestaurantsReturn {
  const { searchQuery = '', petPolicyFilter = null, cuisineFilter = null } = options

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase.from('restaurants').select('*')
        .eq('status', 'approved')

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,cuisine_type.ilike.%${searchQuery}%`)
      }

      // Apply pet policy filter
      if (petPolicyFilter) {
        query = query.eq('pet_policy', petPolicyFilter)
      }

      // Apply cuisine filter
      if (cuisineFilter) {
        query = query.eq('cuisine_type', cuisineFilter)
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 30000)
      )

      const queryPromise = query.order('created_at', { ascending: false })
      
      const result = await Promise.race([queryPromise, timeoutPromise]) as any
      const { data, error: fetchError } = result

      if (fetchError) {
        throw fetchError
      }

      setRestaurants(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch restaurants'
      setError(message)
      console.error('Error fetching restaurants:', err)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, petPolicyFilter, cuisineFilter])

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  // Get featured restaurants (first 6)
  const featuredRestaurants = useMemo(() => {
    return restaurants.slice(0, 6)
  }, [restaurants])

  // Get unique cuisine types
  const cuisineTypes = useMemo(() => {
    const types = new Set(restaurants.map((r) => r.cuisine_type))
    return Array.from(types).sort()
  }, [restaurants])

  return {
    restaurants,
    featuredRestaurants,
    isLoading,
    error,
    refetch: fetchRestaurants,
    cuisineTypes,
  }
}
