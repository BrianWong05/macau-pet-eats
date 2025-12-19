import { supabase } from '@/lib/supabase'
import type { Review, RestaurantRating } from '@/types/database'

// Get all reviews for a restaurant
export async function getRestaurantReviews(restaurantId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      restaurant_id,
      user_id,
      rating,
      comment,
      created_at,
      updated_at
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data || []
}

// Get restaurant rating summary
export async function getRestaurantRating(restaurantId: string): Promise<RestaurantRating | null> {
  const { data, error } = await supabase
    .from('restaurant_ratings')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching rating:', error)
    return null
  }

  return data
}

// Check if current user has reviewed a restaurant
export async function hasUserReviewed(restaurantId: string): Promise<Review | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error checking user review:', error)
    return null
  }

  return data
}

// Create a new review
export async function createReview(
  restaurantId: string,
  rating: number,
  comment: string | null
): Promise<Review> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      restaurant_id: restaurantId,
      user_id: user.id,
      rating,
      comment
    } as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating review:', error)
    throw error
  }

  return data
}

// Update an existing review
export async function updateReview(
  reviewId: string,
  rating: number,
  comment: string | null
): Promise<Review> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  const { data, error } = await supabase
    .from('reviews')
    .update({
      rating,
      comment
    } as never)
    .eq('id', reviewId)
    .eq('user_id', user.id) // Ensure user owns the review
    .select()
    .single()

  if (error) {
    console.error('Error updating review:', error)
    throw error
  }

  return data
}

// Delete a review
export async function deleteReview(reviewId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id) // Ensure user owns the review

  if (error) {
    console.error('Error deleting review:', error)
    throw error
  }

  return true
}

// Get user's reviews
export async function getUserReviews(): Promise<Review[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user reviews:', error)
    return []
  }

  return data || []
}
