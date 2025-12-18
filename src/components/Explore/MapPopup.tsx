import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Restaurant } from '@/types/database'
import { getLocalizedText } from '@/types/database'

interface RestaurantPopupProps {
  restaurant: Restaurant
  lang: 'zh' | 'en' | 'pt'
}

export function MapPopup({ restaurant, lang }: RestaurantPopupProps) {
  const { t } = useTranslation()
  const name = getLocalizedText(restaurant, 'name', lang)
  const cuisineType = getLocalizedText(restaurant, 'cuisine_type', lang)

  return (
    <div className="min-w-[200px]">
      <img
        src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300'}
        alt={name}
        className="w-full h-24 object-cover rounded-lg mb-2"
      />
      <h3 className="font-semibold text-neutral-900 mb-1">{name}</h3>
      <p className="text-sm text-neutral-500 mb-2">{cuisineType}</p>
      <Link
        to={`/restaurant/${restaurant.id}`}
        className="block w-full text-center px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
      >
        {t('explore.viewDetails')}
      </Link>
    </div>
  )
}
