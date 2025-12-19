import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PawPrint, X } from 'lucide-react'
import { RestaurantCard } from '@/components/RestaurantCard'
import { SkeletonCardGrid } from '@/components/SkeletonCard'
import { Pagination } from '@/components/Pagination'
import type { Restaurant } from '@/types/database'

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48]

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
  const { t } = useTranslation(['search', 'common'])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Reset page when results or page size change
  useMemo(() => {
    setCurrentPage(1)
  }, [restaurants.length, searchQuery, itemsPerPage])

  const totalPages = Math.ceil(restaurants.length / itemsPerPage)
  
  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return restaurants.slice(startIndex, startIndex + itemsPerPage)
  }, [restaurants, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {t('search:title')}
          </h1>
          {!isLoading && (
            <p className="text-neutral-500 mt-1">
              {t('search:results', { count: restaurants.length })}
            </p>
          )}
        </div>

        {/* Items per page selector */}
        {!isLoading && restaurants.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-sm text-neutral-500">
              {t('search:perPage') || 'Per page'}:
            </label>
            <select
              id="page-size"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && <SkeletonCardGrid count={6} />}

      {/* Results Grid */}
      {!isLoading && restaurants.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRestaurants.map((restaurant, index) => (
              <div
                key={restaurant.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Empty State */}
      {!isLoading && restaurants.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-full mb-6">
            <PawPrint className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-700 mb-2">
            {t('search:noResults')}
          </h3>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            {t('search:noResultsHint')}
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
              {t('search:clearFilters')}
            </button>
          )}
        </div>
      )}
    </main>
  )
}

