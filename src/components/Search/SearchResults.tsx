import { useTranslation } from 'react-i18next'
import { PawPrint, X } from 'lucide-react'
import { RestaurantCard } from '@/components/RestaurantCard'
import { SkeletonCardGrid } from '@/components/SkeletonCard'
import type { Restaurant } from '@/types/database'

interface SearchResultsProps {
  restaurants: Restaurant[]
  isLoading: boolean
  searchQuery: string
  handleClearSearch: () => void
  clearFilters: () => void
  hasActiveFilters: boolean | null | string
}

export function SearchResults({
  restaurants,
  isLoading,
  searchQuery,
  handleClearSearch,
  clearFilters,
  hasActiveFilters
}: SearchResultsProps) {
  const { t } = useTranslation()

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {t('search.title')}
          </h1>
          {!isLoading && (
            <p className="text-neutral-500 mt-1">
              {t('search.results', { count: restaurants.length })}
            </p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <SkeletonCardGrid count={6} />}

      {/* Results Grid */}
      {!isLoading && restaurants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <RestaurantCard restaurant={restaurant} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && restaurants.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-full mb-6">
            <PawPrint className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-700 mb-2">
            {t('search.noResults')}
          </h3>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            {t('search.noResultsHint')}
          </p>
          {(searchQuery || hasActiveFilters) && (
            <button
              onClick={() => {
                handleClearSearch()
                clearFilters()
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
            >
              <X size={18} />
              {t('search.clearFilters')}
            </button>
          )}
        </div>
      )}
    </main>
  )
}
