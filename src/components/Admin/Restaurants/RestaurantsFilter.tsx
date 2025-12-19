import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'

type FilterStatus = 'all' | 'pending' | 'approved'

interface RestaurantsFilterProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterStatus: FilterStatus
  setFilterStatus: (status: FilterStatus) => void
}

export function RestaurantsFilter({ 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus 
}: RestaurantsFilterProps) {
  const { t } = useTranslation(['admin', 'common'])
  const statuses: FilterStatus[] = ['all', 'pending', 'approved']

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t('common:search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div className="flex gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {t(`admin:restaurants.filters.${status}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
