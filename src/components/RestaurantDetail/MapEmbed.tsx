import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import type { Restaurant } from '@/types/database'
import { getLocalizedText } from '@/types/database'
import { getGoogleMapsEmbedSrc } from '@/lib/mapUtils'

interface MapEmbedProps {
  restaurant: Restaurant
  lang: 'zh' | 'en' | 'pt'
}

export function MapEmbed({ restaurant, lang }: MapEmbedProps) {
  const { t } = useTranslation(['restaurant', 'common'])
  const name = getLocalizedText(restaurant, 'name', lang)

  const getMapSrc = () => {
    return getGoogleMapsEmbedSrc(
      restaurant.google_maps_url,
      restaurant.latitude,
      restaurant.longitude,
      restaurant.name, // Pass restaurant name for the map label
      lang // Pass language code
    )
  }

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary-500" />
        {t('restaurant:location')}
      </h2>
      <div className="aspect-video rounded-xl overflow-hidden bg-neutral-100">
        <iframe
          title={`${name} location`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={getMapSrc()}
        />
      </div>
    </div>
  )
}
