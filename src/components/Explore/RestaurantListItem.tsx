import { Link } from 'react-router-dom'
import { MapPin, Utensils } from 'lucide-react'
import type { Restaurant } from '@/types/database'
import { getLocalizedText } from '@/types/database'
import { PetPolicyBadge } from '@/components/PetPolicyBadge'

interface RestaurantListItemProps {
  restaurant: Restaurant
  lang: 'zh' | 'en' | 'pt'
  isSelected: boolean
  onSelect: () => void
}

export function RestaurantListItem({ 
  restaurant, 
  lang, 
  isSelected,
  onSelect 
}: RestaurantListItemProps) {
  const name = getLocalizedText(restaurant, 'name', lang)
  const address = getLocalizedText(restaurant, 'address', lang)
  const cuisineType = getLocalizedText(restaurant, 'cuisine_type', lang)

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      onClick={onSelect}
      className={`
        block p-4 hover:bg-neutral-50 transition-colors
        ${isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : ''}
      `}
    >
      <div className="flex gap-4">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'}
          alt={name}
          className="w-20 h-20 rounded-xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate mb-1">
            {name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
            <Utensils size={14} />
            <span>{cuisineType}</span>
          </div>
          <PetPolicyBadge policy={restaurant.pet_policy} size="sm" />
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-2">
            <MapPin size={12} />
            <span className="truncate">{address}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
