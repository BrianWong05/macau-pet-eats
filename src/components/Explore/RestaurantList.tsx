import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import type { Restaurant } from '@/types/database'
import { RestaurantListItem } from './RestaurantListItem'

interface RestaurantListProps {
  isLoading: boolean
  filteredRestaurants: Restaurant[]
  selectedRestaurant: string | null
  onSelectRestaurant: (id: string) => void
  lang: 'zh' | 'en' | 'pt'
}

export function RestaurantList({
  isLoading,
  filteredRestaurants,
  selectedRestaurant,
  onSelectRestaurant,
  lang
}: RestaurantListProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full md:w-96 lg:w-[420px] bg-white border-r border-neutral-200 overflow-y-auto shrink-0">
      {isLoading ? (
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="p-8 text-center text-neutral-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
          <p>{t('explore.noResults')}</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantListItem
              key={restaurant.id}
              restaurant={restaurant}
              lang={lang}
              isSelected={selectedRestaurant === restaurant.id}
              onSelect={() => onSelectRestaurant(restaurant.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
