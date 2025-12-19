import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Bug, Lightbulb, CheckCircle, Clock, Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Pagination } from '@/components/Pagination'

interface Feedback {
  id: string
  user_id: string | null
  type: 'bug' | 'feature' | 'general'
  message: string
  contact_email: string | null
  page_url: string | null
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
}

interface PendingAction {
  id: string
  status: 'pending' | 'reviewed' | 'resolved'
}

const TYPE_ICONS = {
  bug: Bug,
  feature: Lightbulb,
  general: MessageSquare
}

const TYPE_COLORS = {
  bug: 'text-red-500 bg-red-50',
  feature: 'text-amber-500 bg-amber-50',
  general: 'text-blue-500 bg-blue-50'
}

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700'
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function AdminFeedback() {
  const { t } = useTranslation(['admin', 'search', 'common'])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Comment modal state
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [comment, setComment] = useState('')

  const fetchFeedback = async () => {
    setIsLoading(true)
    let query = supabase
      .from('app_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }

    const { data, error } = await query
    if (!error && data) {
      setFeedback(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchFeedback()
  }, [filterStatus])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, itemsPerPage])

  const totalPages = Math.ceil(feedback.length / itemsPerPage)
  
  const paginatedFeedback = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return feedback.slice(startIndex, startIndex + itemsPerPage)
  }, [feedback, currentPage, itemsPerPage])

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'reviewed' | 'resolved', adminComment?: string) => {
    const { error } = await supabase
      .from('app_feedback')
      .update({ status: newStatus, admin_comment: adminComment || null, updated_at: new Date().toISOString() } as never)
      .eq('id', id)

    if (!error) {
      toast.success(t('admin:feedback.statusUpdated') || 'Status updated')
      fetchFeedback()
    } else {
      toast.error('Failed to update status')
    }
  }

  const openStatusModal = (id: string, status: 'pending' | 'reviewed' | 'resolved') => {
    setPendingAction({ id, status })
    setComment('')
  }

  const confirmStatusChange = () => {
    if (pendingAction) {
      handleStatusChange(pendingAction.id, pendingAction.status, comment || undefined)
      setPendingAction(null)
      setComment('')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('admin:feedback.title') || 'User Feedback'}</h1>
          <p className="text-neutral-500 mt-1">{t('admin:feedback.subtitle') || 'View and manage user feedback'}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'reviewed', 'resolved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filterStatus === status
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {t(`admin:feedback.status.${status}`) || status}
          </button>
        ))}
      </div>

      {/* Per-page selector */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-neutral-500">
          {t('search:results', { count: feedback.length })}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="feedback-page-size" className="text-sm text-neutral-500">
            {t('search:perPage')}:
          </label>
          <select
            id="feedback-page-size"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-neutral-500">Loading...</div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            {t('admin:feedback.empty') || 'No feedback yet'}
          </div>
        ) : (
          paginatedFeedback.map((item) => {
            const TypeIcon = TYPE_ICONS[item.type]
            return (
              <div key={item.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${TYPE_COLORS[item.type]}`}>
                      <TypeIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                          {t(`admin:feedback.status.${item.status}`) || item.status}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-neutral-900 whitespace-pre-wrap">{item.message}</p>
                      {item.contact_email && (
                        <p className="text-sm text-neutral-500 mt-2">
                          📧 {item.contact_email}
                        </p>
                      )}
                      {item.page_url && (
                        <p className="text-xs text-neutral-400 mt-1 truncate">
                          📍 {item.page_url}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex gap-1">
                    {item.status !== 'reviewed' && (
                      <button
                        onClick={() => openStatusModal(item.id, 'reviewed')}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Mark as Reviewed"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    {item.status !== 'resolved' && (
                      <button
                        onClick={() => openStatusModal(item.id, 'resolved')}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark as Resolved"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {item.status !== 'pending' && (
                      <button
                        onClick={() => openStatusModal(item.id, 'pending')}
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Mark as Pending"
                      >
                        <Clock size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Comment Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                {t('admin:comment.title') || 'Add Comment'}
              </h3>
              <button
                onClick={() => setPendingAction(null)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X size={18} className="text-neutral-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm text-neutral-600 mb-2">
                  {t('admin:comment.hint') || 'Add a comment for the user (optional)'}
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('admin:comment.placeholder') || 'Enter your response...'}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingAction(null)}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  {t('common:cancel')}
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                  {t('common:submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
