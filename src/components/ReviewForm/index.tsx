import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { StarRating } from '@/components/StarRating'
import { toast } from 'sonner'

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>
  initialRating?: number
  initialComment?: string
  isEditing?: boolean
  isLoading?: boolean
}

export function ReviewForm({
  onSubmit,
  initialRating = 0,
  initialComment = '',
  isEditing = false,
  isLoading = false
}: ReviewFormProps) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error(t('reviews.ratingRequired'))
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(rating, comment)
      if (!isEditing) {
        setRating(0)
        setComment('')
      }
      toast.success(isEditing ? t('reviews.updated') : t('reviews.submitted'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const isDisabled = isLoading || submitting

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">
          {t('reviews.yourRating')}
        </label>
        <StarRating
          rating={rating}
          interactive={!isDisabled}
          onChange={setRating}
          size="lg"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="review-comment" className="block text-sm font-medium text-neutral-700">
          {t('reviews.yourReview')}
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('reviews.commentPlaceholder')}
          disabled={isDisabled}
          rows={4}
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl resize-none
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-neutral-50 disabled:cursor-not-allowed
            placeholder:text-neutral-400"
        />
      </div>

      <button
        type="submit"
        disabled={isDisabled || rating === 0}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 
          text-white font-medium rounded-xl transition-colors
          disabled:bg-neutral-300 disabled:cursor-not-allowed"
      >
        <Send size={18} />
        {submitting 
          ? t('common.submitting') 
          : isEditing 
            ? t('reviews.updateReview') 
            : t('reviews.submitReview')
        }
      </button>
    </form>
  )
}
