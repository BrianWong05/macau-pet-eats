import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Review, RestaurantRating } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

interface UseReviewsOptions {
  restaurantId: string
}

interface UseReviewsReturn {
  reviews: Review[]
  rating: RestaurantRating | null
  isLoading: boolean
  error: string | null
  hasUserReviewed: boolean
  userReview: Review | null
  submitReview: (rating: number, comment: string, imageFiles?: File[] | null) => Promise<{ error: string | null }>
  updateReview: (reviewId: string, rating: number, comment: string, imageFiles?: File[] | null, removedImages?: string[]) => Promise<{ error: string | null }>
  deleteReview: (reviewId: string) => Promise<{ error: string | null }>
  refetch: () => Promise<void>
}

export function useReviews({ restaurantId }: UseReviewsOptions): UseReviewsReturn {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState<RestaurantRating | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch reviews
      const { data: reviewsData, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      
      const allReviews = (reviewsData as Review[]) || []
      
      // Filter reviews: show visible ones OR my own (even if hidden)
      // Note: Admin page should fetch everything separately, this hook acts for public/user view
      const visibleReviews = allReviews.filter(review => 
        !review.is_hidden || (user && review.user_id === user.id)
      )
      
      setReviews(visibleReviews)

      // Fetch rating summary
      const { data: ratingData } = await supabase
        .from('restaurant_ratings')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .maybeSingle()
      
      setRating(ratingData as RestaurantRating | null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load reviews'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [restaurantId, user?.id])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Find user's review
  const userReview = user ? reviews.find(r => r.user_id === user.id) || null : null
  const hasUserReviewed = !!userReview

  const submitReview = async (reviewRating: number, comment: string, imageFiles?: File[] | null) => {
    if (!user) {
      return { error: 'You must be logged in to submit a review' }
    }

    if (reviewRating < 1 || reviewRating > 5) {
      return { error: 'Rating must be between 1 and 5' }
    }

    try {
      const uploadedImages: string[] = []

      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('review-images')
            .upload(fileName, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('review-images')
            .getPublicUrl(fileName)

          uploadedImages.push(publicUrl)
        }
      }

      const reviewData = {
        restaurant_id: restaurantId,
        user_id: user.id,
        rating: reviewRating,
        comment: comment || null,
        images: uploadedImages,
        image_url: uploadedImages.length > 0 ? uploadedImages[0] : null
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

  const updateReview = async (reviewId: string, reviewRating: number, comment: string, imageFiles?: File[] | null, removedImages?: string[]) => {
    if (!user) {
      return { error: 'You must be logged in to update a review' }
    }

    if (reviewRating < 1 || reviewRating > 5) {
      return { error: 'Rating must be between 1 and 5' }
    }

    try {
      // Fetch current review
      const { data: currentReviewData, error: fetchError } = await supabase
        .from('reviews')
        .select('images, image_url')
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .single()
      
      if (fetchError) throw fetchError
      
      const currentReview = currentReviewData as { images: string[] | null, image_url: string | null }

      let currentImages: string[] = currentReview.images || []
      // Migration fallback
      if (currentImages.length === 0 && currentReview.image_url) {
        currentImages = [currentReview.image_url]
      }

      // Remove deleted
      if (removedImages && removedImages.length > 0) {
        currentImages = currentImages.filter(img => !removedImages.includes(img))
      }

      // Upload new
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('review-images')
            .upload(fileName, file)
            
          if (uploadError) throw uploadError
          
          const { data: { publicUrl } } = supabase.storage
            .from('review-images')
            .getPublicUrl(fileName)
            
          currentImages.push(publicUrl)
        }
      }

      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          rating: reviewRating,
          comment: comment || null,
          images: currentImages,
          image_url: currentImages.length > 0 ? currentImages[0] : null
        } as never)
        .eq('id', reviewId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      await fetchReviews()
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update review'
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
        .eq('user_id', user.id)

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
    rating,
    isLoading,
    error,
    hasUserReviewed,
    userReview,
    submitReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
  }
}

