import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Star, User, Trash2, Image as ImageIcon, Camera, X, Edit2, AlertTriangle } from 'lucide-react'
import { useReviews } from '@/hooks/useReviews'
import { ReviewFormModal } from '@/components/ReviewFormModal'
import type { Review } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

interface ReviewsSectionProps {
  restaurantId: string
  onAuthRequired: () => void
}

export function ReviewsSection({ restaurantId, onAuthRequired }: ReviewsSectionProps) {
  const { t } = useTranslation(['restaurant', 'common', 'auth', 'profile'])
  const { user } = useAuth()
  
  const { reviews, isLoading: reviewsLoading, submitReview, deleteReview, refetch } = useReviews({ 
    restaurantId: restaurantId || '' 
  })
  
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  const handleWriteReview = () => {
    if (!user) {
      onAuthRequired()
    } else {
      setShowReviewForm(true)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      
      // Check size (2MB limit per file)
      const oversized = newFiles.some(f => f.size > 2 * 1024 * 1024)
      if (oversized) {
        setReviewError(t('submit:form.uploadHint') || 'Max 2MB per file')
        return
      }
      
      setImageFiles(prev => [...prev, ...newFiles])
      
      // Generate previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))
      setImagePreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      const url = prev[index]
      URL.revokeObjectURL(url)
      return prev.filter((_, i) => i !== index)
    })
  }

  // Cleanup previews
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setReviewError(null)

    const { error } = await submitReview(rating, comment, imageFiles)
    
    if (error) {
      setReviewError(error)
    } else {
      setShowReviewForm(false)
      setComment('')
      setRating(5)
      setImageFiles([])
      setImagePreviews([])
    }
    setIsSubmitting(false)
  }

  const handleDeleteReview = async (reviewId: string) => {
    await deleteReview(reviewId)
  }

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-500" />
          {t('restaurant:reviews.title', { count: reviews.length })}
        </h2>
        <button
          onClick={handleWriteReview}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Star size={16} />
          {t('restaurant:reviews.writeReview')}
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && user && (
        <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-neutral-50 rounded-xl">
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('restaurant:reviews.yourRating')}
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
              {t('restaurant:reviews.yourReview')}
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('restaurant:reviews.reviewPlaceholder')}
              rows={3}
              required
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('restaurant:reviews.addPhoto')}
            </label>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative inline-block">
                    <img 
                      src={preview} 
                      alt={`Preview ${idx + 1}`} 
                      className="h-24 w-24 rounded-lg object-cover border border-neutral-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-neutral-500 hover:text-red-500 transition-colors"
                      aria-label="Remove photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2 mt-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                <ImageIcon size={18} />
                {t('restaurant:reviews.uploadPhoto')}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                <Camera size={18} />
                {t('restaurant:reviews.takePhoto')}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              {t('restaurant:reviews.photoHint')}
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
              {isSubmitting ? t('common:loading') : t('restaurant:reviews.submitReview')}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-6 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-xl transition-colors"
            >
              {t('common:cancel')}
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
          <p>{t('restaurant:reviews.noReviews')}</p>
          {!user && (
            <button
              onClick={handleWriteReview}
              className="text-primary-600 font-medium hover:text-primary-700 transition-colors mt-2"
            >
              {t('restaurant:reviews.loginToReview')}
            </button>
          )}
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
                    <div className="text-xs text-neutral-400 flex items-center gap-2">
                      {new Date(review.created_at).toLocaleDateString(navigator.language)}
                      {review.is_hidden && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full">
                          {t('common:hidden')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {review.user_id === user?.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingReview(review)
                        setShowEditModal(true)
                      }}
                      className="p-1 text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
                      title={t('common:edit')}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                    onClick={() => {
                      if (confirm(t('common:confirmDelete'))) {
                        handleDeleteReview(review.id)
                      }
                    }}
                      className="p-1 text-neutral-400 hover:text-red-500 transition-colors rounded-full hover:bg-neutral-100"
                      title={t('common:delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-neutral-700">{review.comment}</p>
              {/* Review Images */}
              {(review.images && review.images.length > 0) ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {review.images.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img} 
                      alt={`Review attachment ${idx + 1}`} 
                      className="h-32 w-32 rounded-lg object-cover border border-neutral-200 flex-shrink-0"
                    />
                  ))}
                </div>
              ) : review.image_url && (
                <div className="mt-3">
                  <img 
                    src={review.image_url} 
                    alt="Review attachment" 
                    className="max-h-48 rounded-lg object-cover border border-neutral-200"
                  />
                </div>
              )}

              {/* Admin Comment for Hidden Reviews */}
              {review.is_hidden && review.admin_comment && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-red-500" />
                    <p className="text-xs font-medium text-red-700">{t('common:adminComment')}</p>
                  </div>
                  <p className="text-sm text-red-800">{review.admin_comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingReview && (
        <ReviewFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            refetch()
            setShowEditModal(false)
          }}
          review={editingReview}
        />
      )}
    </div>
  )
}
