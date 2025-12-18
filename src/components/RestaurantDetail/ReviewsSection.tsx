import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Star, User, Trash2, Image as ImageIcon, Camera, X } from 'lucide-react'
import { useReviews } from '@/hooks/useReviews'
import { useAuth } from '@/contexts/AuthContext'

interface ReviewsSectionProps {
  restaurantId: string
  lang: 'zh' | 'en' | 'pt'
  onAuthRequired: () => void
}

export function ReviewsSection({ restaurantId, lang, onAuthRequired }: ReviewsSectionProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  
  const { reviews, isLoading: reviewsLoading, submitReview, deleteReview } = useReviews({ 
    restaurantId: restaurantId || '' 
  })
  
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleWriteReview = () => {
    if (!user) {
      onAuthRequired()
    } else {
      setShowReviewForm(true)
    }
  }

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

  return (
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
  )
}
