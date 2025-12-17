// Pet Policy enum
export type PetPolicy = 
  | 'indoors_allowed'
  | 'patio_only'
  | 'small_pets_only'
  | 'all_pets_welcome'
  | 'dogs_only'
  | 'cats_only'

// Pet policy display labels
export const PET_POLICY_LABELS: Record<PetPolicy, string> = {
  indoors_allowed: 'Indoors Allowed',
  patio_only: 'Patio Only',
  small_pets_only: 'Small Pets Only',
  all_pets_welcome: 'All Pets Welcome',
  dogs_only: 'Dogs Only',
  cats_only: 'Cats Only',
}

// Restaurant entity
export interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  latitude: number
  longitude: number
  pet_policy: PetPolicy
  cuisine_type: string
  image_url: string
  contact_info: string
  created_at: string
  updated_at: string
}

// Review entity
export interface Review {
  id: string
  restaurant_id: string
  user_id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string
  created_at: string
  updated_at: string
}

// Supabase Database types
export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant
        Insert: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

// Form types for submissions
export interface RestaurantSubmission {
  name: string
  description: string
  address: string
  latitude?: number
  longitude?: number
  pet_policy: PetPolicy
  cuisine_type: string
  image_url?: string
  contact_info: string
}
