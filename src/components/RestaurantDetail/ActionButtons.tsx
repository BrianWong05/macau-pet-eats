import { useTranslation } from 'react-i18next'
import { Navigation, Phone, Flag } from 'lucide-react'
import type { Restaurant } from '@/types/database'

interface ActionButtonsProps {
  restaurant: Restaurant
  onReportClick: () => void
}

export function ActionButtons({ restaurant, onReportClick }: ActionButtonsProps) {
  const { t } = useTranslation()

  const getGoogleMapsUrl = () => {
    if (!restaurant) return '#'
    const { latitude, longitude, name } = restaurant
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(name)}`
  }

  const getPhoneLink = () => {
    if (!restaurant?.contact_info) return '#'
    return `tel:${restaurant.contact_info.replace(/\s/g, '')}`
  }

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <a
        href={getGoogleMapsUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        <Navigation size={20} />
        {t('restaurant.getDirections')}
      </a>
      
      {restaurant.contact_info && (
        <a
          href={getPhoneLink()}
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-neutral-200 hover:border-primary-300 text-neutral-700 font-semibold rounded-xl shadow-soft hover:shadow-lg transition-all"
        >
          <Phone size={20} />
          {t('restaurant.callNow')}
        </a>
      )}
      
      <button
        onClick={onReportClick}
        className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-neutral-200 hover:border-amber-300 text-neutral-700 font-semibold rounded-xl shadow-soft hover:shadow-lg transition-all"
      >
        <Flag size={20} />
        {t('restaurant.reportUpdate')}
      </button>
    </div>
  )
}
