import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import type { Restaurant } from '@/types/database'
import { getLocalizedText } from '@/types/database'
import { extractCoordsFromUrl, extractPlaceFromUrl } from '@/lib/mapUtils'

interface MapEmbedProps {
  restaurant: Restaurant
  lang: 'zh' | 'en' | 'pt'
}

export function MapEmbed({ restaurant, lang }: MapEmbedProps) {
  const { t } = useTranslation()
  const name = getLocalizedText(restaurant, 'name', lang)

  const getMapSrc = () => {
    // If google_maps_url is available, try to parse it for best experience
    if (restaurant.google_maps_url) {
      const coords = extractCoordsFromUrl(restaurant.google_maps_url)
      const placeName = extractPlaceFromUrl(restaurant.google_maps_url)

      if (coords && placeName) {
        // Best case: Coords + Name
        return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}+(${encodeURIComponent(placeName)})&z=15&output=embed`
      }
      
      if (placeName) {
        // Name only
        return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&z=15&output=embed`
      }
      
      if (coords) {
        // Coords only
        return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`
      }
    }
    
    // Fallback to database coordinates
    return `https://maps.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}&z=16&output=embed`
  }

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary-500" />
        {t('restaurant.location')}
      </h3>
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
