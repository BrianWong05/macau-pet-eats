import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Search as SearchIcon, 
  X, 
  ArrowLeft, 
  PawPrint,
  Filter
} from 'lucide-react'
import { useRestaurants } from '@/hooks/useRestaurants'
import { RestaurantCard } from '@/components/RestaurantCard'
import { SkeletonCardGrid } from '@/components/SkeletonCard'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { PetPolicy } from '@/types/database'

// Pet policy options
const PET_POLICY_OPTIONS: PetPolicy[] = [
  'indoors_allowed',
  'patio_only',
  'small_pets_only',
  'all_pets_welcome',
  'dogs_only',
  'cats_only'
]

export function Search() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en' | 'pt'
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get initial query from URL
  const initialQuery = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [petPolicyFilter, setPetPolicyFilter] = useState<PetPolicy | null>(null)
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { restaurants, cuisineTypes, isLoading } = useRestaurants({
    searchQuery: debouncedQuery,
    petPolicyFilter,
    cuisineFilter
  })

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      // Update URL with search query
      if (searchQuery) {
        setSearchParams({ q: searchQuery })
      } else {
        setSearchParams({})
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, setSearchParams])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setDebouncedQuery('')
    setSearchParams({})
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setPetPolicyFilter(null)
    setCuisineFilter(null)
  }, [])

  const hasActiveFilters = petPolicyFilter || cuisineFilter

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-neutral-200 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link
              to="/"
              className="p-2 hover:bg-neutral-100 rounded-xl transition-colors shrink-0"
              aria-label={t('restaurant.backToList')}
            >
              <ArrowLeft size={20} className="text-neutral-600" />
            </Link>

            {/* Search Input */}
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                autoFocus
                className="
                  w-full pl-12 pr-12 py-3
                  text-base
                  bg-neutral-50
                  border border-neutral-200
                  rounded-xl
                  placeholder:text-neutral-400
                  focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white
                  transition-all duration-200
                "
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={t('common.close')}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                inline-flex items-center gap-2 px-4 py-3
                rounded-xl border text-sm font-medium
                transition-all shrink-0
                ${hasActiveFilters 
                  ? 'bg-primary-50 border-primary-200 text-primary-700' 
                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }
              `}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">{t('explore.filters.petPolicy')}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-neutral-100 bg-white px-4 py-4 animate-fade-in">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Pet Policy Filter */}
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  {t('explore.filters.petPolicy')}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPetPolicyFilter(null)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all
                      ${!petPolicyFilter
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }
                    `}
                  >
                    {t('explore.filters.all')}
                  </button>
                  {PET_POLICY_OPTIONS.map((policy) => (
                    <button
                      key={policy}
                      onClick={() => setPetPolicyFilter(policy)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-all
                        ${petPolicyFilter === policy
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }
                      `}
                    >
                      {t(`petPolicy.${policy}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisine Filter */}
              {cuisineTypes.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">
                    {t('explore.filters.cuisine')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCuisineFilter(null)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-all
                        ${!cuisineFilter
                          ? 'bg-secondary-500 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }
                      `}
                    >
                      {t('explore.filters.all')}
                    </button>
                    {cuisineTypes.map((ct) => (
                      <button
                        key={ct.id}
                        onClick={() => setCuisineFilter(ct.name)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm font-medium transition-all
                          ${cuisineFilter === ct.name
                            ? 'bg-secondary-500 text-white shadow-sm'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }
                        `}
                      >
                        {lang === 'zh' ? (ct.name_zh || ct.name) : 
                         lang === 'pt' ? (ct.name_pt || ct.name) : ct.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700"
                >
                  <X size={14} />
                  {t('search.clearFilters')}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
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
    </div>
  )
}
