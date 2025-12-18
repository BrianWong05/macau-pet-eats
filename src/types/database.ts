// Supported languages
export type Language = 'en' | 'zh' | 'pt'

// Pet Policy enum
export type PetPolicy = 
  | 'indoors_allowed'
  | 'patio_only'
  | 'small_pets_only'
  | 'all_pets_welcome'
  | 'dogs_only'
  | 'cats_only'

// Restaurant entity with multilingual fields
export interface Restaurant {
  id: string
  
  // English (default)
  name: string
  description: string
  address: string
  status: 'pending' | 'approved' | 'rejected'
  
  // Chinese (中文)
  name_zh: string | null
  description_zh: string | null
  address_zh: string | null
  
  // Portuguese (Português)
  name_pt: string | null
  description_pt: string | null
  address_pt: string | null
  
  // Location
  latitude: number
  longitude: number
  google_maps_url: string | null
  
  // Details
  pet_policy: PetPolicy
  cuisine_type: string[]
  cuisine_type_zh: string[] | null
  cuisine_type_pt: string[] | null
  image_url: string
  gallery_images: string[]
  contact_info: string
  opening_hours: OpeningHours | null
  menu_images: string[]
  social_media: SocialMedia | null
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Index signature for dynamic access
  [key: string]: string | number | null | string[] | OpeningHours | SocialMedia | null
}

// Opening hours type
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface DayHours {
  open: string  // e.g., "09:00"
  close: string // e.g., "22:00"
}

export type OpeningHours = {
  [key in DayOfWeek]?: DayHours | null
}

// Social media links
export interface SocialMedia {
  facebook?: string
  instagram?: string
  website?: string
}

// Cuisine type from database
export interface CuisineType {
  id: string
  name: string
  name_zh?: string
  name_pt?: string
  sort_order: number
  created_at?: string
  updated_at?: string
}

// Helper function to get localized text from Restaurant
export function getLocalizedText(
  restaurant: Restaurant,
  field: 'name' | 'description' | 'address',
  language: Language
): string
export function getLocalizedText(
  restaurant: Restaurant,
  field: 'cuisine_type',
  language: Language
): string[]
export function getLocalizedText(
  restaurant: Restaurant,
  field: 'name' | 'description' | 'address' | 'cuisine_type',
  language: Language
): string | string[] {
  if (language === 'en') {
    return (restaurant[field] as string | string[]) || (field === 'cuisine_type' ? [] : '')
  }
  
  const localizedField = `${field}_${language}`
  const val = restaurant[localizedField]
  if (val) {
    if (Array.isArray(val) && val.length > 0) {
       return val as string[]
    }
    if (typeof val === 'string') {
       return val
    }
  }
  return (restaurant[field] as string | string[]) || (field === 'cuisine_type' ? [] : '')
}

// Profile entity
export interface Profile {
  id: string
  email: string
  is_admin: boolean
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
  image_url?: string | null
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
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'created_at' | 'updated_at'>>
      }
      restaurant_reports: {
        Row: RestaurantReport
        Insert: Omit<RestaurantReport, 'id' | 'created_at' | 'reviewed_at' | 'reviewed_by' | 'status'>
        Update: Partial<Pick<RestaurantReport, 'status' | 'reviewed_at' | 'reviewed_by'>>
      }
    }
  }
}

// Restaurant Report type
export type ReportStatus = 'pending' | 'approved' | 'rejected'

export interface RestaurantReport {
  id: string
  restaurant_id: string
  user_id: string | null
  field_name: string
  suggested_value: string
  reason: string | null
  status: ReportStatus
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

// Form types for submissions
export interface RestaurantSubmission {
  name: string
  name_zh?: string
  name_pt?: string
  description: string
  description_zh?: string
  description_pt?: string
  address: string
  address_zh?: string
  address_pt?: string
  latitude?: number
  longitude?: number
  pet_policy: PetPolicy
  cuisine_type: string[]
  cuisine_type_zh?: string[]
  cuisine_type_pt?: string[]
  image_url?: string
  gallery_images?: string[]
  contact_info: string
  social_media?: SocialMedia
}

