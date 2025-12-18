import { useTranslation } from 'react-i18next'
import { Image as ImageIcon } from 'lucide-react'
import type { Restaurant } from '@/types/database'
import { getLocalizedText } from '@/types/database'

interface PhotoGalleryProps {
  restaurant: Restaurant
  lang: 'zh' | 'en' | 'pt'
}

export function PhotoGallery({ restaurant, lang }: PhotoGalleryProps) {
  const { t } = useTranslation()
  const name = getLocalizedText(restaurant, 'name', lang)

  if (!restaurant.gallery_images || restaurant.gallery_images.length === 0) return null

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-primary-500" />
        {t('restaurant.photos')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {restaurant.gallery_images.map((img, index) => (
          <div key={index} className="aspect-square rounded-xl overflow-hidden bg-neutral-100 group relative">
            <img
              src={img}
              alt={`${name} photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  )
}
