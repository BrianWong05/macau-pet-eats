import { useTranslation } from 'react-i18next'
import { Utensils, FileText } from 'lucide-react'
import type { Restaurant } from '@/types/database'
import { useState } from 'react' // Added useState import
import { X } from 'lucide-react' // Added X import

interface MenuSectionProps {
  restaurant: Restaurant
}

export function MenuSection({ restaurant }: MenuSectionProps) {
  const { t } = useTranslation(['restaurant', 'common'])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!restaurant.menu_images || restaurant.menu_images.length === 0) return null

  const isPdf = (url: string) => url.toLowerCase().endsWith('.pdf')

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
        <Utensils className="w-5 h-5 text-primary-500" />
        {t('restaurant:menu')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {restaurant.menu_images.map((url, index) => (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow"
          >
            {isPdf(url) ? (
              // PDF display - show icon and label
              <div className="w-full h-40 bg-neutral-50 flex flex-col items-center justify-center">
                <FileText size={40} className="text-red-500 mb-2" />
                <span className="text-sm font-medium text-neutral-700">
                  {t('restaurant:viewMenu') || 'View Menu'}
                </span>
                <span className="text-xs text-neutral-500 mt-1">PDF</span>
              </div>
            ) : (
              // Image display
              <img
                src={url}
                alt={`Menu ${index + 1}`}
                className="w-full h-40 object-cover hover:scale-105 transition-transform"
              />
            )}
          </a>
        ))}
      </div>
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-3xl max-h-full overflow-auto">
            <button
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setSelectedImage(null)}
              aria-label={t('common:close')}
            >
              <X size={24} />
            </button>
            <img src={selectedImage} alt="Full size menu" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
