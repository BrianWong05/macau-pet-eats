import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Review } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

interface UseReviewsOptions {
  restaurantId: string
}

interface UseReviewsReturn {
  reviews: Review[]
  isLoading: boolean
  error: string | null
  submitReview: (rating: number, comment: string, imageFile?: File | null) => Promise<{ error: string | null }>
  deleteReview: (reviewId: string) => Promise<{ error: string | null }>
  refetch: () => Promise<void>
}

export function useReviews({ restaurantId }: UseReviewsOptions): UseReviewsReturn {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setReviews((data as Review[]) || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load reviews'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [restaurantId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const submitReview = async (rating: number, comment: string, imageFile: File | null = null) => {
    if (!user) {
      return { error: 'You must be logged in to submit a review' }
    }

    try {
      // In a real app, upload image to storage first
      // const imageUrl = await uploadImage(imageFile)
      
      // For now, if there's a file, we can fake a URL or just ignore since we don't have storage yet
      const image_url = imageFile ? URL.createObjectURL(imageFile) : null

      // Use type assertion for the insert
      const reviewData = {
        restaurant_id: restaurantId,
        user_id: user.id,
        rating,
        comment,
        image_url
      }
      
      const { error: insertError } = await supabase
        .from('reviews')
        .insert(reviewData as never)

      if (insertError) throw insertError

      await fetchReviews()
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review'
      return { error: message }
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!user) {
      return { error: 'You must be logged in to delete a review' }
    }

    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id) // Ensure user can only delete their own reviews

      if (deleteError) throw deleteError

      await fetchReviews()
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete review'
      return { error: message }
    }
  }

  return {
    reviews,
    isLoading,
    error,
    submitReview,
    deleteReview,
    refetch: fetchReviews,
  }
}
