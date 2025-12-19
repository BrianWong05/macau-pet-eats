import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useReviews } from '@/hooks/useReviews'
import { StarRating } from '@/components/StarRating'
import { ReviewCard } from '@/components/ReviewCard'
import { ReviewForm } from '@/components/ReviewForm'
import type { Review } from '@/types/database'

interface ReviewSectionProps {
  restaurantId: string
  onAuthRequired?: () => void
}

export function ReviewSection({ restaurantId, onAuthRequired }: ReviewSectionProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { 
    reviews, 
    rating, 
    isLoading, 
    hasUserReviewed,
    userReview,
    submitReview,
    updateReview,
    deleteReview
  } = useReviews({ restaurantId })

  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  const handleSubmit = async (reviewRating: number, comment: string) => {
    if (editingReview) {
      const { error } = await updateReview(editingReview.id, reviewRating, comment)
      if (!error) {
        setEditingReview(null)
        setShowForm(false)
      }
    } else {
      const { error } = await submitReview(reviewRating, comment)
      if (!error) {
        setShowForm(false)
      }
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm(t('reviews.deleteReview') + '?')) return
    
    const { error } = await deleteReview(reviewId)
    if (!error) {
      toast.success(t('reviews.deleted'))
    }
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Header with Rating Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-neutral-900">{t('reviews.title')}</h2>
          {rating && (
            <div className="flex items-center gap-2">
              <StarRating rating={rating.average_rating} size="sm" />
              <span className="text-sm text-neutral-600">
                {rating.average_rating.toFixed(1)} ({t('reviews.reviewCount', { count: rating.review_count })})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Write Review Section */}
      {!isLoading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          {!user ? (
            // Not logged in
            <button
              onClick={onAuthRequired}
              className="w-full flex items-center justify-center gap-2 py-3 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <LogIn size={18} />
              {t('reviews.loginToReview')}
            </button>
          ) : hasUserReviewed && !showForm ? (
            // User already reviewed - show their review with edit option
            <div className="space-y-3">
              <p className="text-sm text-neutral-500">{t('reviews.yourReview')}:</p>
              {userReview && (
                <ReviewCard
                  review={userReview}
                  isOwner
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          ) : showForm ? (
            // Show review form
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-neutral-900">
                  {editingReview ? t('reviews.updateReview') : t('reviews.writeReview')}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingReview(null)
                  }}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  {t('common.cancel')}
                </button>
              </div>
              <ReviewForm
                onSubmit={handleSubmit}
                initialRating={editingReview?.rating || 0}
                initialComment={editingReview?.comment || ''}
                isEditing={!!editingReview}
              />
            </div>
          ) : (
            // Show write review button
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <MessageSquare size={18} />
              {t('reviews.writeReview')}
            </button>
          )}
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-neutral-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-neutral-200">
          <MessageSquare size={40} className="mx-auto text-neutral-300 mb-3" />
          <p className="text-neutral-600">{t('reviews.noReviews')}</p>
          <p className="text-neutral-400 text-sm mt-1">{t('reviews.noReviewsHint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews
            .filter(r => r.id !== userReview?.id) // Don't show user's review twice
            .map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwner={user?.id === review.user_id}
                onEdit={user?.id === review.user_id ? handleEdit : undefined}
                onDelete={user?.id === review.user_id ? handleDelete : undefined}
              />
            ))}
        </div>
      )}
    </div>
  )
}
