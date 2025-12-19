import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import * as favoritesService from '@/services/favorites'
import type { Favorite } from '@/types/database'

interface UseFavoritesReturn {
  favorites: Favorite[]
  isLoading: boolean
  isFavorited: (restaurantId: string) => boolean
  toggleFavorite: (restaurantId: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useFavorites(): UseFavoritesReturn {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const data = await favoritesService.getUserFavorites()
      setFavorites(data)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const isFavorited = useCallback((restaurantId: string): boolean => {
    return favorites.some(f => f.restaurant_id === restaurantId)
  }, [favorites])

  const toggleFavorite = useCallback(async (restaurantId: string): Promise<boolean> => {
    if (!user) throw new Error('User not authenticated')

    const currentlyFavorited = isFavorited(restaurantId)
    
    // Optimistic update
    if (currentlyFavorited) {
      setFavorites(prev => prev.filter(f => f.restaurant_id !== restaurantId))
    } else {
      setFavorites(prev => [...prev, {
        user_id: user.id,
        restaurant_id: restaurantId,
        created_at: new Date().toISOString()
      }])
    }

    try {
      const newState = await favoritesService.toggleFavorite(restaurantId, currentlyFavorited)
      return newState
    } catch (error) {
      // Rollback on error
      fetchFavorites()
      throw error
    }
  }, [user, isFavorited, fetchFavorites])

  return {
    favorites,
    isLoading,
    isFavorited,
    toggleFavorite,
    refetch: fetchFavorites
  }
}
