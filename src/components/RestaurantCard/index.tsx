import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Utensils } from 'lucide-react'
import type { Restaurant } from '@/types/database'
import { getLocalizedText } from '@/types/database'
import { PetPolicyBadge } from '@/components/PetPolicyBadge'
import { FavoriteButton } from '@/components/FavoriteButton'
import { useCuisineTypes } from '@/contexts/CuisineTypesContext'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en' | 'pt'
  const { getLocalizedName } = useCuisineTypes()
  
  const { id, pet_policy, image_url } = restaurant
  
  // Get localized content
  const name = getLocalizedText(restaurant, 'name', lang)
  const description = getLocalizedText(restaurant, 'description', lang)
  const address = getLocalizedText(restaurant, 'address', lang)
  // Always use 'en' for cuisine_type since localization happens via getLocalizedName()
  const cuisineType = getLocalizedText(restaurant, 'cuisine_type', 'en')

  return (
    <div className="relative group">
      <Link
        to={`/restaurant/${id}`}
        className="
          block bg-white rounded-xl sm:rounded-2xl overflow-hidden
          shadow-card card-hover
          focus:outline-none focus:ring-4 focus:ring-primary-200
        "
      >
        {/* Mobile: Horizontal layout */}
        <div className="flex sm:hidden">
          {/* Small square image */}
          <div className="relative w-28 h-28 shrink-0">
            <img
              src={image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
              alt={name}
              className="w-full h-full object-cover"
            />
            {/* Cuisine badge on image */}
            <div className="absolute bottom-1 right-1">
              <span className="
                inline-flex items-center gap-1 px-1.5 py-0.5
                bg-white/90 backdrop-blur-sm
                text-[10px] font-medium text-neutral-700
                rounded-full
              ">
                <Utensils size={10} />
                {cuisineType.slice(0, 1).map(c => getLocalizedName(c, lang)).join('')}
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-3 flex flex-col justify-center gap-1">
            <h3 className="text-base font-semibold text-neutral-900 line-clamp-1">
              {name}
            </h3>
            <PetPolicyBadge policy={pet_policy} size="sm" />
            <div className="flex items-center gap-1 text-neutral-500 text-xs">
              <MapPin size={10} className="shrink-0" />
              <span className="line-clamp-1">{address}</span>
            </div>
          </div>
        </div>

        {/* Desktop: Vertical layout */}
        <div className="hidden sm:block">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
              alt={name}
              className="
                w-full h-full object-cover
                group-hover:scale-105 transition-transform duration-500 ease-out
              "
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            <div className="absolute top-3 left-3">
              <span className="
                inline-flex items-center gap-1.5 px-3 py-1.5
                bg-white/90 backdrop-blur-sm
                text-sm font-medium text-neutral-700
                rounded-full
              ">
                <Utensils size={14} />
                {cuisineType.map(c => getLocalizedName(c, lang)).join(', ')}
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5 space-y-3">
            {/* Title */}
            <h3 className="
              text-xl font-semibold text-neutral-900
              group-hover:text-primary-600 transition-colors
              line-clamp-1
            ">
              {name}
            </h3>
            
            {/* Pet Policy Badge */}
            <PetPolicyBadge policy={pet_policy} size="sm" />
            
            {/* Description */}
            <p className="text-neutral-600 text-sm line-clamp-2 leading-relaxed">
              {description}
            </p>
            
            {/* Address */}
            <div className="flex items-center gap-2 text-neutral-500 text-sm pt-1">
              <MapPin size={14} className="shrink-0" />
              <span className="line-clamp-1">{address}</span>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Favorite Button - Positioned outside Link to prevent navigation */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
        <FavoriteButton 
          restaurantId={id} 
          size="sm"
        />
      </div>
    </div>
  )
}

