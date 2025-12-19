import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Restaurant } from '@/types/database'
import { RestaurantFormModal } from '@/components/RestaurantFormModal'
import { RestaurantsFilter } from '@/components/Admin/Restaurants/RestaurantsFilter'
import { RestaurantsTable } from '@/components/Admin/Restaurants/RestaurantsTable'
import { Pagination } from '@/components/Pagination'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function AdminRestaurants() {
  const { t } = useTranslation(['admin', 'search', 'common'])
  const [searchParams, setSearchParams] = useSearchParams()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Comment modal state for approve/reject
  interface PendingAction {
    type: 'approve' | 'reject'
    restaurantId: string
    restaurantName: string
  }
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [comment, setComment] = useState('')

  const fetchRestaurants = async () => {
    setIsLoading(true)
    let query = supabase.from('restaurants').select('*').order('created_at', { ascending: false })
    
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }

    const { data, error } = await query
    
    if (!error && data) {
      const restaurantsData = data as Restaurant[]
      setRestaurants(restaurantsData)
      
      // Handle deep link edit
      const editId = searchParams.get('edit')
      if (editId) {
        const target = restaurantsData.find(r => r.id === editId)
        if (target) {
          setEditingRestaurant(target)
          setIsModalOpen(true)
          // Clear param so it doesn't reopen on refresh/filter change
          setSearchParams(params => {
            params.delete('edit')
            return params
          })
        } else {
            // If not in current list (e.g. filtered out), fetch explicitly? 
            // For now, let's assume if it exists it's likely relevant. 
            // Or we can do a single fetch if not found.
            const { data: singleData } = await supabase.from('restaurants').select('*').eq('id', editId).single()
            if (singleData) {
                setEditingRestaurant(singleData)
                setIsModalOpen(true)
                setSearchParams(params => {
                    params.delete('edit')
                    return params
                })
            }
        }
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchRestaurants()
  }, [filterStatus])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus, itemsPerPage])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return

    const { error } = await supabase.from('restaurants').delete().eq('id', id)
    if (!error) {
      toast.success('Restaurant deleted successfully')
      fetchRestaurants()
    }
  }

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected', adminComment?: string) => {
    const { error } = await supabase
      .from('restaurants')
      .update({ status, admin_comment: adminComment || null } as never)
      .eq('id', id)

    if (!error) {
      toast.success(status === 'approved' ? t('admin:restaurants.actions.approveSuccess') : t('admin:restaurants.actions.rejectSuccess'))
      fetchRestaurants()
    }
  }

  // Wrapper functions for modal
  const openApproveModal = (id: string, name: string) => {
    setPendingAction({ type: 'approve', restaurantId: id, restaurantName: name })
    setComment('')
  }

  const openRejectModal = (id: string, name: string) => {
    setPendingAction({ type: 'reject', restaurantId: id, restaurantName: name })
    setComment('')
  }

  const confirmAction = async () => {
    if (!pendingAction) return
    await handleStatusUpdate(pendingAction.restaurantId, pendingAction.type === 'approve' ? 'approved' : 'rejected', comment || undefined)
    setPendingAction(null)
    setComment('')
  }

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.name_zh?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage)
  
  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredRestaurants.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredRestaurants, currentPage, itemsPerPage])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('admin:restaurants.title')}</h1>
          <p className="text-neutral-500 mt-1">{t('admin:restaurants.subtitle')}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          onClick={() => {
            setEditingRestaurant(null)
            setIsModalOpen(true)
          }}
        >
          <Plus size={20} />
          {t('admin:restaurants.addRestaurant')}
        </button>
      </div>

      <RestaurantsFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Per-page selector */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-neutral-500">
          {t('search:results', { count: filteredRestaurants.length })}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="admin-page-size" className="text-sm text-neutral-500">
            {t('search:perPage')}:
          </label>
          <select
            id="admin-page-size"
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

      <RestaurantsTable 
        restaurants={paginatedRestaurants}
        isLoading={isLoading}
        onApprove={(restaurant) => openApproveModal(restaurant.id, restaurant.name)}
        onReject={(restaurant) => openRejectModal(restaurant.id, restaurant.name)}
        onEdit={(restaurant) => {
          setEditingRestaurant(restaurant)
          setIsModalOpen(true)
        }}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <RestaurantFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          fetchRestaurants()
          setIsModalOpen(false)
        }}
        restaurant={editingRestaurant}
      />

      {/* Comment Modal for Approve/Reject */}
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
                <p className="text-sm text-neutral-600 mb-1">
                  {pendingAction.type === 'approve' ? t('admin:restaurants.actions.approve') : t('admin:restaurants.actions.reject')}: <strong>{pendingAction.restaurantName}</strong>
                </p>
                <p className="text-sm text-neutral-500 mb-2">
                  {t('admin:comment.hint') || 'Add a comment for the user (optional)'}
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('admin:comment.placeholder') || 'Enter your response...'}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  autoFocus
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
                  onClick={confirmAction}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium text-white transition-colors ${
                    pendingAction.type === 'approve' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {pendingAction.type === 'approve' ? t('admin:restaurants.actions.approve') : t('admin:restaurants.actions.reject')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
