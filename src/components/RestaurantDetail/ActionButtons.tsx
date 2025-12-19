import { useTranslation } from 'react-i18next'
import { Navigation, Phone, Flag, Heart } from 'lucide-react'
import type { Restaurant } from '@/types/database'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface ActionButtonsProps {
  restaurant: Restaurant
  onReportClick: () => void
  onEditClick?: () => void
  onAuthRequired?: () => void
  isAdmin?: boolean
}

export function ActionButtons({ restaurant, onReportClick, onEditClick, onAuthRequired, isAdmin }: ActionButtonsProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  
  const isFav = isFavorited(restaurant.id)

  const handleFavoriteClick = async () => {
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired()
      } else {
        toast.error(t('common.loginRequired'))
      }
      return
    }
    
    try {
      await toggleFavorite(restaurant.id)
      toast.success(isFav ? t('favorites.removed') : t('favorites.added'))
    } catch {
      toast.error(t('common.error'))
    }
  }

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
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className={`flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl shadow-soft hover:shadow-lg transition-all ${
          isFav 
            ? 'bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100' 
            : 'bg-white border-2 border-neutral-200 hover:border-red-300 text-neutral-700'
        }`}
      >
        <Heart size={20} className={isFav ? 'fill-red-500' : ''} />
        {isFav ? t('favorites.saved') : t('favorites.save')}
      </button>
      
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

      {isAdmin && (
        <button
          onClick={onEditClick}
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-6 py-4 bg-neutral-800 hover:bg-neutral-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          {t('common.edit') || 'Edit'}
        </button>
      )}
    </div>
  )
}

