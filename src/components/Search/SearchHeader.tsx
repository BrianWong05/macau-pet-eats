import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Search as SearchIcon, X, Filter } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface SearchHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  handleClearSearch: () => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  hasActiveFilters: boolean | null | string
}

export function SearchHeader({
  searchQuery,
  setSearchQuery,
  handleClearSearch,
  showFilters,
  setShowFilters,
  hasActiveFilters
}: SearchHeaderProps) {
  const { t } = useTranslation(['search', 'restaurant', 'common'])

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <Link
          to="/"
          className="p-2 hover:bg-neutral-100 rounded-xl transition-colors shrink-0"
          aria-label={t('restaurant:backToList')}
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
            placeholder={t('search:placeholder')}
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
              aria-label={t('common:close')}
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
          <span className="hidden sm:inline">{t('search:filter')}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher />
      </div>
    </div>
  )
}
