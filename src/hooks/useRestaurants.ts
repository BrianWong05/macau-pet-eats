import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Restaurant, PetPolicy, CuisineType } from '@/types/database'

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
  cuisineTypes: CuisineType[]
}

export function useRestaurants(options: UseRestaurantsOptions = {}): UseRestaurantsReturn {
  const { searchQuery = '', petPolicyFilter = null, cuisineFilter = null } = options

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([])
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

      // Apply cuisine filter - use ilike for case-insensitive matching
      if (cuisineFilter) {
        query = query.ilike('cuisine_type', cuisineFilter)
      }

      console.log('useRestaurants: Fetching restaurants...')
      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) {
        console.error('useRestaurants: Error', fetchError)
        throw fetchError
      }

      console.log('useRestaurants: Data received', data?.length)
      setRestaurants(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch restaurants'
      setError(message)
      console.error('Error fetching restaurants:', err)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, petPolicyFilter, cuisineFilter])

  // Fetch cuisine types from database
  useEffect(() => {
    const fetchCuisineTypes = async () => {
      const { data } = await supabase
        .from('cuisine_types')
        .select('*')
        .order('sort_order', { ascending: true })
      if (data) setCuisineTypes(data)
    }
    fetchCuisineTypes()
  }, [])

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  // Get featured restaurants (first 6)
  const featuredRestaurants = useMemo(() => {
    return restaurants.slice(0, 6)
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
