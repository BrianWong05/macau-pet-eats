import { useTranslation } from 'react-i18next'
import { CheckCircle, Clock, XCircle, Edit, Trash2 } from 'lucide-react'
import type { Restaurant } from '@/types/database'

interface RestaurantsTableProps {
  restaurants: Restaurant[]
  isLoading: boolean
  onStatusUpdate: (id: string, status: 'approved' | 'rejected') => void
  onEdit: (restaurant: Restaurant) => void
  onDelete: (id: string) => void
}

export function RestaurantsTable({ 
  restaurants, 
  isLoading, 
  onStatusUpdate, 
  onEdit, 
  onDelete 
}: RestaurantsTableProps) {
  const { t } = useTranslation()

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
        {status === 'pending' ? t('admin.restaurants.status.pending') :
         status === 'approved' ? t('admin.restaurants.status.approved') :
         status === 'rejected' ? t('admin.restaurants.status.rejected') : status}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('admin.restaurants.table.headers.restaurant')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('admin.restaurants.table.headers.status')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('admin.restaurants.table.headers.petPolicy')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('admin.restaurants.table.headers.submitted')}</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('admin.restaurants.table.headers.actions')}</th>
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
            ) : restaurants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                  {t('admin.restaurants.table.noRestaurants')}
                </td>
              </tr>
            ) : (
              restaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={restaurant.image_url || 'https://via.placeholder.com/40'}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                      />
                      <div>
                        <p className="font-medium text-neutral-900">{restaurant.name_zh || restaurant.name}</p>
                        <p className="text-sm text-neutral-500">
                          {Array.isArray(restaurant.cuisine_type) 
                            ? restaurant.cuisine_type.map(c => t(`cuisineTypes.${c.toLowerCase()}`) || c).join(', ')
                            : restaurant.cuisine_type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={restaurant.status || 'approved'} />
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {t(`petPolicy.${restaurant.pet_policy}`)}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {new Date(restaurant.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {restaurant.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onStatusUpdate(restaurant.id, 'approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => onStatusUpdate(restaurant.id, 'rejected')}
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
                        onClick={() => onEdit(restaurant)}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => onDelete(restaurant.id)}
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
  )
}
