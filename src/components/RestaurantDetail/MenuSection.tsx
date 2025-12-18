import { useTranslation } from 'react-i18next'
import { Utensils } from 'lucide-react'
import type { Restaurant } from '@/types/database'

interface MenuSectionProps {
  restaurant: Restaurant
}

export function MenuSection({ restaurant }: MenuSectionProps) {
  const { t } = useTranslation()

  if (!restaurant.menu_images || restaurant.menu_images.length === 0) return null

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <Utensils className="w-5 h-5 text-primary-500" />
        {t('restaurant.menu')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {restaurant.menu_images.map((image, index) => (
          <a
            key={index}
            href={image}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow"
          >
            <img
              src={image}
              alt={`Menu ${index + 1}`}
              className="w-full h-40 object-cover hover:scale-105 transition-transform"
            />
          </a>
        ))}
      </div>
    </div>
  )
}
