import { Utensils } from 'lucide-react'
import { PetPolicyBadge } from '@/components/PetPolicyBadge'
import type { Restaurant } from '@/types/database'
import { getLocalizedText } from '@/types/database'
import { useCuisineTypes } from '@/contexts/CuisineTypesContext'

interface HeroImageProps {
  restaurant: Restaurant
  lang: 'zh' | 'en' | 'pt'
}

export function HeroImage({ restaurant, lang }: HeroImageProps) {
  const { getLocalizedName } = useCuisineTypes()
  const name = getLocalizedText(restaurant, 'name', lang)
  // Always use 'en' for cuisine_type since localization happens via getLocalizedName()
  const cuisineType = getLocalizedText(restaurant, 'cuisine_type', 'en')

  return (
    <div className="relative h-64 md:h-96">
      <img
        src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
        alt={name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
            {name}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <PetPolicyBadge policy={restaurant.pet_policy} size="lg" />
            {cuisineType.map((type, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sm font-medium text-neutral-700 rounded-full">
                <Utensils size={14} />
                {getLocalizedName(type, lang)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
