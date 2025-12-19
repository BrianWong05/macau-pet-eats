import { useTranslation } from 'react-i18next'
import { MapPin, Phone, ExternalLink, AlertCircle } from 'lucide-react'
import type { Restaurant } from '@/types/database'
import { getLocalizedText } from '@/types/database'

interface InfoCardProps {
  restaurant: Restaurant
  lang: 'zh' | 'en' | 'pt'
}

export function InfoCard({ restaurant, lang }: InfoCardProps) {
  const { t } = useTranslation()
  const description = getLocalizedText(restaurant, 'description', lang)
  const address = getLocalizedText(restaurant, 'address', lang)

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
    <>
      {/* Description Card */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <p className="text-lg text-neutral-700 leading-relaxed mb-4">
          {description}
        </p>
        <div className="flex items-start gap-2 pt-3 border-t border-neutral-100">
          <AlertCircle className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-500 italic">
            {lang === 'zh' ? '此描述可能由 AI 生成，請以實際為準' : 
             lang === 'pt' ? 'Esta descrição pode ser gerada por IA, por favor confirme com o local' :
             'This description may be AI-generated, please verify with the restaurant'}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <MapPin className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-1">
                {t('restaurant.address')}
              </h3>
              <p className="text-neutral-600 mb-3">{address}</p>
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                {t('restaurant.openInMaps')}
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {restaurant.contact_info && (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary-100 rounded-xl">
                <Phone className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 mb-1">
                  {t('restaurant.contact')}
                </h3>
                <a
                  href={getPhoneLink()}
                  className="text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {restaurant.contact_info}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
