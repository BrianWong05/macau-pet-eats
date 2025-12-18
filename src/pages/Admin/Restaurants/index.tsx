import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Restaurant } from '@/types/database'
import { RestaurantFormModal } from '@/components/RestaurantFormModal'
import { RestaurantsFilter } from '@/components/Admin/Restaurants/RestaurantsFilter'
import { RestaurantsTable } from '@/components/Admin/Restaurants/RestaurantsTable'

export function AdminRestaurants() {
  const { t } = useTranslation()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)

  const fetchRestaurants = async () => {
    setIsLoading(true)
    let query = supabase.from('restaurants').select('*').order('created_at', { ascending: false })
    
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }

    const { data, error } = await query
    
    if (!error && data) {
      setRestaurants(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchRestaurants()
  }, [filterStatus])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return

    const { error } = await supabase.from('restaurants').delete().eq('id', id)
    if (!error) {
      toast.success('Restaurant deleted successfully')
      fetchRestaurants()
    }
  }

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('restaurants')
      .update({ status } as never)
      .eq('id', id)

    if (!error) {
      toast.success(`Restaurant ${status} successfully`)
      toast.success(status === 'approved' ? t('admin.restaurants.actions.approveSuccess') : t('admin.restaurants.actions.rejectSuccess'))
      fetchRestaurants()
    }
  }

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.name_zh?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('admin.restaurants.title')}</h1>
          <p className="text-neutral-500 mt-1">{t('admin.restaurants.subtitle')}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          onClick={() => {
            setEditingRestaurant(null)
            setIsModalOpen(true)
          }}
        >
          <Plus size={20} />
          {t('admin.restaurants.addRestaurant')}
        </button>
      </div>

      <RestaurantsFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <RestaurantsTable 
        restaurants={filteredRestaurants}
        isLoading={isLoading}
        onStatusUpdate={handleStatusUpdate}
        onEdit={(restaurant) => {
          setEditingRestaurant(restaurant)
          setIsModalOpen(true)
        }}
        onDelete={handleDelete}
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
    </div>
  )
}
