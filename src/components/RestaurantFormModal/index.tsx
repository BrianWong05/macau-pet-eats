import { useState, useEffect } from 'react'
import { X, Loader } from 'lucide-react'
// import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import type { Restaurant } from '@/types/database'

interface RestaurantFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  restaurant?: Restaurant | null
}

const CUISINE_TYPES = [
  'Portuguese',
  'Macanese',
  'Chinese',
  'Japanese',
  'Italian',
  'American',
  'Cafe',
  'Bar',
  'Dessert',
  'Other'
]

const PET_POLICIES = [
  'indoors_allowed',
  'patio_only',
  'small_pets_only',
  'all_pets_welcome',
  'dogs_only',
  'cats_only'
]

export function RestaurantFormModal({ isOpen, onClose, onSave, restaurant }: RestaurantFormModalProps) {
// const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: '',
    address: '',
    description: '',
    pet_policy: 'patio_only',
    cuisine_type: '',
    contact_info: '',
    image_url: '',
    latitude: 22.1937,
    longitude: 113.5399,
    status: 'approved'
  })

  useEffect(() => {
    if (restaurant) {
      setFormData(restaurant)
    } else {
      setFormData({
        name: '',
        address: '',
        description: '',
        pet_policy: 'patio_only',
        cuisine_type: '',
        contact_info: '',
        image_url: '',
        latitude: 22.1937,
        longitude: 113.5399,
        status: 'approved'
      })
    }
  }, [restaurant, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (restaurant?.id) {
        // Update
        const { error } = await supabase
          .from('restaurants')
          .update(formData as never)
          .eq('id', restaurant.id)
        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('restaurants')
          .insert(formData as never)
        if (error) throw error
      }
      onSave()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-100 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-neutral-900">
            {restaurant ? 'Edit Restaurant' : 'Add Restaurant'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Cuisine Type *</label>
              <select
                required
                value={formData.cuisine_type || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cuisine_type: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Cuisine</option>
                {CUISINE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Pet Policy *</label>
              <select
                required
                value={formData.pet_policy || 'patio_only'}
                onChange={(e) => setFormData(prev => ({ ...prev, pet_policy: e.target.value as any }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                {PET_POLICIES.map(policy => (
                  <option key={policy} value={policy}>{policy.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Status</label>
              <select
                value={formData.status || 'pending'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Address *</label>
            <input
              type="text"
              required
              value={formData.address || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Latitude *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Longitude *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Image URL</label>
            <input
              type="url"
              value={formData.image_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="https://..."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-neutral-600 font-medium hover:bg-neutral-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {restaurant ? 'Save Changes' : 'Create Restaurant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
