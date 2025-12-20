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
  | 'medium_dogs_allowed'

// Restaurant entity with multilingual fields
export interface Restaurant {
  id: string
  
  // English (default)
  name: string
  description: string
  address: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_by: string | null  // User ID who submitted
  admin_comment?: string | null  // Admin's comment on decision
  
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
  location: string | null  // Area: 澳門, 氹仔, 路環
  
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
  [key: string]: string | number | null | string[] | OpeningHours | SocialMedia | undefined
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

// Pet policy from database
export interface PetPolicyType {
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
  comment: string | null
  image_url: string | null
  images: string[] | null
  created_at: string
  updated_at: string
  // Joined data (optional, populated when fetching with user info)
  user_email?: string
  user_avatar?: string
}

// Favorite entity
export interface Favorite {
  user_id: string
  restaurant_id: string
  created_at: string
  // Joined data (optional)
  restaurant?: Restaurant
}

// Pet size enum
export type PetSize = 'small' | 'medium' | 'large'

// User Pet entity
export interface UserPet {
  id: string
  user_id: string
  name: string
  type: string // 'dog', 'cat', etc.
  size: PetSize
  breed: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

// Restaurant rating summary
export interface RestaurantRating {
  restaurant_id: string
  review_count: number
  average_rating: number
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

// App Feedback type
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved'
export type FeedbackType = 'bug' | 'feature' | 'general'

export interface AppFeedback {
  id: string
  user_id: string | null
  type: FeedbackType
  message: string
  contact_email: string | null
  page_url: string | null
  status: FeedbackStatus
  created_at: string
  updated_at: string
  admin_comment?: string | null
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
  admin_comment?: string | null
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

