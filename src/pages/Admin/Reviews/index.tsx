import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Star, Trash2, EyeOff, Eye, Search, X, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Pagination } from '@/components/Pagination'
import { ReviewFormModal } from '@/components/ReviewFormModal'

interface Review {
  id: string
  restaurant_id: string
  user_id: string
  rating: number
  comment: string | null
  image_url: string | null
  images: string[] | null
  admin_comment: string | null
  is_hidden: boolean
  created_at: string
  restaurants: {
    id: string
    name: string
    name_zh: string | null
  } | null
}

// Star rating component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}
        />
      ))}
    </div>
  )
}

export function AdminReviews() {
  const { t, i18n } = useTranslation(['admin', 'common'])
  const lang = i18n.language as 'zh' | 'en' | 'pt'
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [filterHidden, setFilterHidden] = useState<'all' | 'visible' | 'hidden'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)

  // Delete confirmation modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  
  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  // Hide Review Modal (for comment)
  const [hideConfirmId, setHideConfirmId] = useState<string | null>(null)
  const [adminComment, setAdminComment] = useState('')

  const fetchReviews = async () => {
    setIsLoading(true)
    
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        restaurants(id, name, name_zh)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setReviews(data as Review[])
    } else if (error) {
      console.error('Error fetching reviews:', error)
      toast.error(t('common:error'))
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterRating, filterHidden, searchQuery, itemsPerPage])

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      // Rating filter
      if (filterRating !== 'all' && review.rating !== filterRating) return false
      
      // Hidden filter
      if (filterHidden === 'visible' && review.is_hidden) return false
      if (filterHidden === 'hidden' && !review.is_hidden) return false
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const restaurantName = (review.restaurants?.name_zh || review.restaurants?.name || '').toLowerCase()
        const comment = (review.comment || '').toLowerCase()
        const reviewer = review.user_id.toLowerCase()
        
        if (!restaurantName.includes(query) && !comment.includes(query) && !reviewer.includes(query)) {
          return false
        }
      }
      
      return true
    })
  }, [reviews, filterRating, filterHidden, searchQuery])

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)
  
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredReviews.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredReviews, currentPage, itemsPerPage])

  // Toggle hide/show review
  const handleToggleHiddenRequest = (id: string, currentlyHidden: boolean) => {
    if (!currentlyHidden) {
      // If we are hiding it, show modal to ask for comment
      setHideConfirmId(id)
      setAdminComment('')
    } else {
      // If unhiding, just do it (maybe clear comment?)
      executeToggleHidden(id, true, null)
    }
  }

  const executeToggleHidden = async (id: string, currentlyHidden: boolean, comment: string | null) => {
    const updateData: any = { is_hidden: !currentlyHidden }
    if (comment !== null) {
      updateData.admin_comment = comment
    }

    const { error } = await supabase
      .from('reviews')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updateData as never)
      .eq('id', id)

    if (!error) {
      toast.success(currentlyHidden ? t('admin:reviews.unhidden') : t('admin:reviews.hidden'))
      fetchReviews()
      setHideConfirmId(null)
      setAdminComment('')
    } else {
      toast.error(t('common:error'))
    }
  }

  // Hard delete review
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (!error) {
      toast.success(t('admin:reviews.deleted'))
      setDeleteConfirmId(null)
      fetchReviews()
    } else {
      console.error('Delete error:', error)
      toast.error(t('common:error'))
    }
  }

  // Handle edit
  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setShowEditModal(true)
  }

  const getRestaurantName = (review: Review) => {
    if (!review.restaurants) return '-'
    return lang === 'zh' && review.restaurants.name_zh 
      ? review.restaurants.name_zh 
      : review.restaurants.name
  }

  const getReviewerName = (review: Review) => {
    // Show truncated user_id since we don't have a profiles join
    return review.user_id ? review.user_id.slice(0, 8) + '...' : '-'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t('admin:reviews.title')}</h1>
        <p className="text-neutral-500">{t('admin:reviews.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('admin:reviews.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{t('admin:reviews.allRatings')}</option>
            {[5, 4, 3, 2, 1].map(rating => (
              <option key={rating} value={rating}>{rating} ★</option>
            ))}
          </select>

          {/* Hidden Filter */}
          <select
            value={filterHidden}
            onChange={(e) => setFilterHidden(e.target.value as 'all' | 'visible' | 'hidden')}
            className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{t('admin:reviews.allStatus')}</option>
            <option value="visible">{t('admin:reviews.visibleOnly')}</option>
            <option value="hidden">{t('admin:reviews.hiddenOnly')}</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-neutral-500">
        <span>{t('admin:reviews.total')}: {reviews.length}</span>
        <span>{t('admin:reviews.filtered')}: {filteredReviews.length}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">{t('admin:reviews.restaurant')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">{t('admin:reviews.reviewer')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">{t('admin:reviews.rating')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">{t('admin:reviews.comment')}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">{t('admin:reviews.date')}</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">{t('admin:reviews.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                    {t('admin:reviews.noReviews')}
                  </td>
                </tr>
              ) : (
                paginatedReviews.map(review => (
                  <tr 
                    key={review.id} 
                    className={`hover:bg-neutral-50 ${review.is_hidden ? 'opacity-50 bg-neutral-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-neutral-900 line-clamp-1">
                        {getRestaurantName(review)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 line-clamp-1">
                        {getReviewerName(review)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm text-neutral-600 line-clamp-2" title={review.comment || ''}>
                        {review.comment || <span className="text-neutral-400 italic">-</span>}
                      </p>
                      {review.is_hidden && review.admin_comment && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-xs">
                          <span className="font-medium text-red-700 block mb-0.5">{t('common:adminComment')}:</span>
                          <span className="text-red-600">{review.admin_comment}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500 whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(review)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title={t('common:edit')}
                        >
                          <Edit2 size={18} />
                        </button>

                        {/* Toggle Hide */}
                        <button
                          onClick={() => handleToggleHiddenRequest(review.id, review.is_hidden)}
                          className={`p-2 rounded-lg transition-colors ${
                            review.is_hidden
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={review.is_hidden ? t('admin:reviews.unhide') : t('admin:reviews.hide')}
                        >
                          {review.is_hidden ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirmId(review.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('common:delete')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              {t('admin:reviews.deleteConfirmTitle')}
            </h3>
            <p className="text-neutral-600">
              {t('admin:reviews.deleteConfirmMessage')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                {t('common:delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hide Confirmation/Comment Modal */}
      {hideConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              {t('admin:reviews.hideConfirmTitle') || 'Hide Review'}
            </h3>
            <p className="text-neutral-600 text-sm">
              {t('admin:reviews.hideConfirmMessage') || 'Please provide a reason for hiding this review (optional):'}
            </p>
            <textarea
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Reason for hiding..."
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm h-24 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setHideConfirmId(null)
                  setAdminComment('')
                }}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={() => executeToggleHidden(hideConfirmId, false, adminComment)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                {t('admin:reviews.confirmHide') || 'Hide'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingReview && (
        <ReviewFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchReviews()
            setShowEditModal(false)
          }}
          review={editingReview}
        />
      )}
    </div>
  )
}
