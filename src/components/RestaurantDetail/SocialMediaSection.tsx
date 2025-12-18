import { useTranslation } from 'react-i18next'
import { Facebook, Instagram, Globe } from 'lucide-react'
import type { Restaurant, SocialMedia } from '@/types/database'

interface SocialMediaSectionProps {
  restaurant: Restaurant
}

export function SocialMediaSection({ restaurant }: SocialMediaSectionProps) {
  const { t } = useTranslation()

  if (!restaurant.social_media || !Object.values(restaurant.social_media as SocialMedia).some(v => v)) {
    return null
  }

  return (
    <div className="mt-4 bg-white rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-neutral-900 mb-4">
        {t('restaurant.socialMedia.title')}
      </h3>
      <div className="flex gap-4">
        {(restaurant.social_media as SocialMedia).facebook && (
          <a
            href={(restaurant.social_media as SocialMedia).facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Facebook size={18} />
            <span className="text-sm font-medium">Facebook</span>
          </a>
        )}
        {(restaurant.social_media as SocialMedia).instagram && (
          <a
            href={(restaurant.social_media as SocialMedia).instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
          >
            <Instagram size={18} />
            <span className="text-sm font-medium">Instagram</span>
          </a>
        )}
        {(restaurant.social_media as SocialMedia).website && (
          <a
            href={(restaurant.social_media as SocialMedia).website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <Globe size={18} />
            <span className="text-sm font-medium">{t('restaurant.socialMedia.website')}</span>
          </a>
        )}
      </div>
    </div>
  )
}
