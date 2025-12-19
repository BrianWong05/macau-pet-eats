import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Restaurant, PetPolicy, CuisineType } from '@/types/database'

// Location areas in Macau
export const LOCATION_AREAS = ['澳門', '氹仔', '路環'] as const
export type LocationArea = typeof LOCATION_AREAS[number]

interface UseRestaurantsOptions {
  searchQuery?: string
  petPolicyFilter?: PetPolicy | null
  cuisineFilters?: string[]  // Changed to array for multi-select
  locationFilter?: LocationArea | null
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
  const { searchQuery = '', petPolicyFilter = null, cuisineFilters = [], locationFilter = null } = options

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([])  // Store all for client-side filtering
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
        // Simple search on name for now as cuisine_type is array
        // To search array text, we would need to cast or use text search
        query = query.ilike('name', `%${searchQuery}%`)
      }

      // Apply pet policy filter
      if (petPolicyFilter) {
        query = query.eq('pet_policy', petPolicyFilter)
      }

      // Apply location filter (filter by location column)
      if (locationFilter) {
        query = query.eq('location', locationFilter)
      }

      console.log('useRestaurants: Fetching restaurants...')
      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) {
        console.error('useRestaurants: Error', fetchError)
        throw fetchError
      }

      console.log('useRestaurants: Data received', data?.length)
      setAllRestaurants(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch restaurants'
      setError(message)
      console.error('Error fetching restaurants:', err)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, petPolicyFilter, locationFilter])

  // Client-side filtering for multiple cuisine types (OR logic)
  useEffect(() => {
    if (cuisineFilters.length === 0) {
      // No cuisine filter = show all
      setRestaurants(allRestaurants)
    } else {
      // Filter restaurants that have ANY of the selected cuisine types
      const filtered = allRestaurants.filter(restaurant => {
        const restaurantCuisines = (restaurant.cuisine_type || []).map((c: string) => c.toLowerCase())
        return cuisineFilters.some(filter => 
          restaurantCuisines.includes(filter.toLowerCase())
        )
      })
      setRestaurants(filtered)
    }
  }, [allRestaurants, cuisineFilters])

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
