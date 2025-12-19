import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { checkIsFavorited } from '@/services/favorites'
import { hasUserReviewed } from '@/services/reviews'
import type { Review } from '@/types/database'

interface UseUserInteractionsReturn {
  isFavorited: boolean
  isLoading: boolean
  userReview: Review | null
  hasReviewed: boolean
  refetch: () => Promise<void>
}

export function useUserInteractions(restaurantId: string): UseUserInteractionsReturn {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchInteractions = useCallback(async () => {
    if (!user || !restaurantId) {
      setIsFavorited(false)
      setUserReview(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const [favorited, review] = await Promise.all([
        checkIsFavorited(restaurantId),
        hasUserReviewed(restaurantId)
      ])
      
      setIsFavorited(favorited)
      setUserReview(review)
    } catch (error) {
      console.error('Error fetching user interactions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, restaurantId])

  useEffect(() => {
    fetchInteractions()
  }, [fetchInteractions])

  return {
    isFavorited,
    isLoading,
    userReview,
    hasReviewed: !!userReview,
    refetch: fetchInteractions
  }
}
