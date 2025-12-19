import { useTranslation } from 'react-i18next'
import { Image as ImageIcon } from 'lucide-react'
import type { Restaurant } from '@/types/database'

import { useState } from 'react' // Added import for useState
import { X } from 'lucide-react' // Added import for X icon

interface PhotoGalleryProps {
  restaurant: Restaurant
  // lang: 'zh' | 'en' | 'pt' // Removed lang prop
}

export function PhotoGallery({ restaurant }: PhotoGalleryProps) {
  const { t } = useTranslation(['restaurant', 'common'])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!restaurant.gallery_images || restaurant.gallery_images.length === 0) return null

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-primary-500" />
        {t('restaurant:gallery.title')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {restaurant.gallery_images.map((img, index) => (
          <div key={index} className="aspect-square rounded-xl overflow-hidden bg-neutral-100 group relative">
            <img
              src={img}
              alt={`Restaurant photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
              onClick={() => setSelectedImage(img)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4" onClick={() => setSelectedImage(null)}>
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
            aria-label={t('common:close')}
          >
            <X size={32} />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size view" 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  )
}
