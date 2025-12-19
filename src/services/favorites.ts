import { supabase } from '@/lib/supabase'
import type { Favorite, Restaurant } from '@/types/database'

// Check if a restaurant is favorited by the current user
export async function checkIsFavorited(restaurantId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('favorites')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('restaurant_id', restaurantId)
    .maybeSingle()

  if (error) {
    console.error('Error checking favorite status:', error)
    return false
  }

  return !!data
}

// Add a restaurant to favorites
export async function addFavorite(restaurantId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      restaurant_id: restaurantId
    } as never)

  if (error) {
    // Ignore duplicate key error (already favorited)
    if (error.code === '23505') return true
    console.error('Error adding favorite:', error)
    throw error
  }

  return true
}

// Remove a restaurant from favorites
export async function removeFavorite(restaurantId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('restaurant_id', restaurantId)

  if (error) {
    console.error('Error removing favorite:', error)
    throw error
  }

  return true
}

// Toggle favorite status
export async function toggleFavorite(restaurantId: string, currentlyFavorited: boolean): Promise<boolean> {
  if (currentlyFavorited) {
    await removeFavorite(restaurantId)
    return false
  } else {
    await addFavorite(restaurantId)
    return true
  }
}

// Get all favorites for the current user
export async function getUserFavorites(): Promise<Favorite[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      user_id,
      restaurant_id,
      created_at,
      restaurant:restaurants(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorites:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((item: any) => ({
    user_id: item.user_id,
    restaurant_id: item.restaurant_id,
    created_at: item.created_at,
    restaurant: item.restaurant as Restaurant
  }))
}

// Get favorite count for a restaurant
export async function getFavoriteCount(restaurantId: string): Promise<number> {
  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)

  if (error) {
    console.error('Error getting favorite count:', error)
    return 0
  }

  return count || 0
}
