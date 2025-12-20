import { useTranslation } from 'react-i18next'
import { Trash2, Edit2 } from 'lucide-react'
import { StarRating } from '@/components/StarRating'
import type { Review } from '@/types/database'
import { UserAvatar } from '@/components/UserAvatar'

interface ReviewCardProps {
  review: Review
  isOwner?: boolean
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: string) => void
}

export function ReviewCard({ review, isOwner = false, onEdit, onDelete }: ReviewCardProps) {
  const { t } = useTranslation(['restaurant', 'common'])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar user={review.users} size="md" />
          <div>
            <p className="font-medium text-neutral-900">
              {review.users?.name || t('restaurant:reviews.anonymous')}
            </p>
            <p className="text-xs text-neutral-500">{formatDate(review.created_at)}</p>
          </div>
        </div>
        
        <StarRating rating={review.rating} size="sm" />
      </div>

      {review.comment && (
        <p className="text-neutral-700 text-sm leading-relaxed">
          {review.comment}
        </p>
      )}

      {isOwner && (onEdit || onDelete) && (
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
          {onEdit && (
            <button
              onClick={() => onEdit(review)}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-primary-600 transition-colors"
            >
              <Edit2 size={14} />
              {t('common:edit')}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
              {t('common:delete')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
