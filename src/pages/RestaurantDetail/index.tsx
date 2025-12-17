import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Utensils, 
  Navigation,
  ExternalLink,
  Star,
  MessageSquare,
  User,
  Camera,
  Image as ImageIcon,
  X,
  Upload,
  Trash2,
  LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Restaurant } from '@/types/database'
import { getLocalizedText } from '@/types/database'
import { PetPolicyBadge } from '@/components/PetPolicyBadge'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import { useReviews } from '@/hooks/useReviews'

export function RestaurantDetail() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en' | 'pt'
  const { user, signOut } = useAuth()
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Reviews state
  const { reviews, isLoading: reviewsLoading, submitReview, deleteReview } = useReviews({ 
    restaurantId: id || '' 
  })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  
  // Photo upload state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setReviewError(t('submit.form.uploadHint'))
        return
      }
      setImageFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

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

  const handleWriteReview = () => {
    if (!user) {
      setShowAuthModal(true)
    } else {
      setShowReviewForm(true)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setReviewError(null)

    const { error } = await submitReview(rating, comment, imageFile)
    
    if (error) {
      setReviewError(error)
    } else {
      setShowReviewForm(false)
      setComment('')
      setRating(5)
      setImageFile(null)
      setImagePreview(null)
    }
    setIsSubmitting(false)
  }

  const handleDeleteReview = async (reviewId: string) => {
    await deleteReview(reviewId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
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

  const name = getLocalizedText(restaurant, 'name', lang)
  const description = getLocalizedText(restaurant, 'description', lang)
  const address = getLocalizedText(restaurant, 'address', lang)
  const cuisineType = getLocalizedText(restaurant, 'cuisine_type', lang)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with Language Switcher */}
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isScrolled ? 'text-neutral-600 hover:bg-neutral-100' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'}`}
          >
            <ArrowLeft size={20} />
            <span className="font-medium hidden sm:block">{t('restaurant.backToList')}</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <span className={`text-sm font-medium hidden sm:block ${isScrolled ? 'text-neutral-700' : 'text-white drop-shadow-md'}`}>
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className={`p-2 rounded-full transition-all ${isScrolled ? 'bg-white shadow-sm text-neutral-600 hover:text-red-600' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'}`}
                  title={t('auth.logout') || 'Logout'}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all font-medium ${isScrolled ? 'bg-white text-neutral-700' : 'bg-white/90 backdrop-blur-sm text-neutral-700'}`}
              >
                <User size={18} />
                <span>{t('auth.login') || 'Login'}</span>
              </button>
            )}
            <Link
              to="/submit"
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all font-medium ${isScrolled ? 'bg-white text-neutral-700' : 'bg-white/90 backdrop-blur-sm text-neutral-700'}`}
            >
              <Upload size={18} />
              <span className="hidden sm:inline">{t('nav.submit')}</span>
            </Link>
            <div className={isScrolled ? '' : 'bg-white/20 backdrop-blur-sm rounded-lg'}>
             <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-64 md:h-96">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        


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

        {/* Gallery Section */}
        {restaurant.gallery_images && restaurant.gallery_images.length > 0 && (
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
        )}

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              {t('reviews.title')}
              <span className="text-neutral-400 font-normal">({reviews.length})</span>
            </h3>
            <button
              onClick={handleWriteReview}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              <Star size={16} />
              {t('reviews.writeReview')}
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && user && (
            <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-neutral-50 rounded-xl">
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('reviews.yourRating')}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-colors"
                    >
                      <Star
                        size={28}
                        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('reviews.yourReview')}
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('reviews.reviewPlaceholder')}
                  rows={3}
                  required
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('reviews.addPhoto')}
                </label>
                
                {!imagePreview ? (
                  <div className="flex gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                      <ImageIcon size={18} />
                      {t('reviews.uploadPhoto')}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                      <Camera size={18} />
                      {t('reviews.takePhoto')}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-32 w-auto rounded-lg object-cover border border-neutral-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-neutral-500 hover:text-red-500 transition-colors"
                      aria-label={t('reviews.removePhoto')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <p className="mt-1 text-xs text-neutral-400">
                  {t('reviews.photoHint')}
                </p>
              </div>

              {reviewError && (
                <p className="text-red-600 text-sm mb-4">{reviewError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-xl transition-colors"
                >
                  {isSubmitting ? t('common.loading') : t('reviews.submitReview')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-xl transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 rounded-xl animate-shimmer" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p>{t('reviews.noReviews')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-neutral-400">
                          {new Date(review.created_at).toLocaleDateString(lang)}
                        </p>
                      </div>
                    </div>
                    {user?.id === review.user_id && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={t('reviews.deleteReview')}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-neutral-700">{review.comment}</p>
                  {review.image_url && (
                    <div className="mt-3">
                      <img 
                        src={review.image_url} 
                        alt="Review attachment" 
                        className="max-h-48 rounded-lg object-cover border border-neutral-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">{t('footer.copyright')}</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}
