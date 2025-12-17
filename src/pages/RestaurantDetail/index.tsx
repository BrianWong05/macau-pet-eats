import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Utensils, 
  Navigation,
  ExternalLink
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Restaurant } from '@/types/database'
import { getLocalizedText } from '@/types/database'
import { PetPolicyBadge } from '@/components/PetPolicyBadge'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function RestaurantDetail() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en' | 'pt'
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRestaurant() {
      if (!id) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const { data, error: fetchError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single()
        
        if (fetchError) throw fetchError
        setRestaurant(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load restaurant'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRestaurant()
  }, [id])

  // Generate Google Maps URL
  const getGoogleMapsUrl = () => {
    if (!restaurant) return '#'
    const { latitude, longitude, name } = restaurant
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(name)}`
  }

  // Generate phone link
  const getPhoneLink = () => {
    if (!restaurant?.contact_info) return '#'
    return `tel:${restaurant.contact_info.replace(/\s/g, '')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Header skeleton */}
        <div className="h-64 md:h-96 animate-shimmer" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-10 w-3/4 rounded-lg animate-shimmer" />
            <div className="h-6 w-1/2 rounded-lg animate-shimmer" />
            <div className="h-32 rounded-xl animate-shimmer" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            {t('errors.loadingRestaurants')}
          </h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft size={18} />
            {t('restaurant.backToList')}
          </Link>
        </div>
      </div>
    )
  }

  // Get localized content
  const name = getLocalizedText(restaurant, 'name', lang)
  const description = getLocalizedText(restaurant, 'description', lang)
  const address = getLocalizedText(restaurant, 'address', lang)
  const cuisineType = getLocalizedText(restaurant, 'cuisine_type', lang)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with Language Switcher */}
      <header className="absolute top-0 right-0 p-4 z-50">
        <LanguageSwitcher />
      </header>

      {/* Hero Image */}
      <div className="relative h-64 md:h-96">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Back button */}
        <Link
          to="/"
          className="absolute top-4 left-4 inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-neutral-700 rounded-xl font-medium hover:bg-white transition-colors shadow-lg"
        >
          <ArrowLeft size={18} />
          {t('restaurant.backToList')}
        </Link>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
              {name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <PetPolicyBadge policy={restaurant.pet_policy} size="lg" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sm font-medium text-neutral-700 rounded-full">
                <Utensils size={14} />
                {cuisineType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Action Buttons */}
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
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <p className="text-lg text-neutral-700 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Address Card */}
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

          {/* Contact Card */}
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

        {/* Map Embed */}
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
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${restaurant.latitude},${restaurant.longitude}&zoom=16`}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
