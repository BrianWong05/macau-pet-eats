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

// Pet policy display labels (multilingual)
export const PET_POLICY_LABELS: Record<PetPolicy, Record<Language, string>> = {
  indoors_allowed: {
    en: 'Indoors Allowed',
    zh: '允許室內',
    pt: 'Interior Permitido',
  },
  patio_only: {
    en: 'Patio Only',
    zh: '僅限露台',
    pt: 'Apenas Terraço',
  },
  small_pets_only: {
    en: 'Small Pets Only',
    zh: '僅限小型寵物',
    pt: 'Apenas Animais Pequenos',
  },
  all_pets_welcome: {
    en: 'All Pets Welcome',
    zh: '歡迎所有寵物',
    pt: 'Todos os Animais Bem-vindos',
  },
  dogs_only: {
    en: 'Dogs Only',
    zh: '僅限狗狗',
    pt: 'Apenas Cães',
  },
  cats_only: {
    en: 'Cats Only',
    zh: '僅限貓咪',
    pt: 'Apenas Gatos',
  },
}

// Restaurant entity with multilingual fields
export interface Restaurant {
  id: string
  
  // English (default)
  name: string
  description: string
  address: string
  
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
  
  // Details
  pet_policy: PetPolicy
  cuisine_type: string
  cuisine_type_zh: string | null
  cuisine_type_pt: string | null
  image_url: string
  contact_info: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

// Helper function to get localized text
export function getLocalizedText<T extends Record<string, unknown>>(
  item: T,
  field: string,
  language: Language
): string {
  if (language === 'en') {
    return (item[field] as string) || ''
  }
  
  const localizedField = `${field}_${language}` as keyof T
  return (item[localizedField] as string) || (item[field] as string) || ''
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
  cuisine_type: string
  cuisine_type_zh?: string
  cuisine_type_pt?: string
  image_url?: string
  contact_info: string
}
