import { useState, useEffect } from 'react'
import { 
  Trash2, 
  Plus, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Edit
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Restaurant } from '@/types/database'
import { RestaurantFormModal } from '@/components/RestaurantFormModal'

export function AdminRestaurants() {
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
      fetchRestaurants()
    }
  }

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('restaurants')
      .update({ status } as never)
      .eq('id', id)

    if (!error) {
      fetchRestaurants()
    }
  }

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.name_zh?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-700',
      rejected: 'bg-red-100 text-red-700'
    }
    const icons = {
      approved: CheckCircle,
      pending: Clock,
      rejected: XCircle
    }
    const Icon = icons[status as keyof typeof icons] || Clock
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Restaurants</h1>
          <p className="text-neutral-500 mt-1">Manage restaurant listings and submissions</p>
        </div>
        <button 
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          onClick={() => {
            setEditingRestaurant(null)
            setIsModalOpen(true)
          }}
        >
          <Plus size={20} />
          Add Restaurant
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterStatus === status 
                  ? 'bg-neutral-900 text-white' 
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Restaurant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pet Policy</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Submited</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 bg-neutral-100 rounded w-3/4 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredRestaurants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No restaurants found
                  </td>
                </tr>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={restaurant.image_url || 'https://via.placeholder.com/40'} 
                          alt="" 
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                        />
                        <div>
                          <p className="font-medium text-neutral-900">{restaurant.name}</p>
                          <p className="text-sm text-neutral-500">{restaurant.cuisine_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={restaurant.status || 'approved'} />
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {restaurant.pet_policy.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(restaurant.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {restaurant.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(restaurant.id, 'approved')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(restaurant.id, 'rejected')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                            <div className="w-px h-4 bg-neutral-200 mx-1" />
                          </>
                        )}
                        <button
                          className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingRestaurant(restaurant)
                            setIsModalOpen(true)
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => handleDelete(restaurant.id)}
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
