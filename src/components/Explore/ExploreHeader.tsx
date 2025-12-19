import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Filter, Upload } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface ExploreHeaderProps {
  filteredCount: number
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  hasActiveFilters: boolean | null | string
}

export function ExploreHeader({
  filteredCount,
  showFilters,
  setShowFilters,
  hasActiveFilters
}: ExploreHeaderProps) {
  const { t } = useTranslation(['explore', 'restaurant', 'common'])

  return (
    <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          aria-label={t('restaurant:backToList')}
        >
          <ArrowLeft size={20} className="text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">
            {t('explore:title')}
          </h1>
          <p className="text-sm text-neutral-500 hidden sm:block">
            {t('explore:results', { count: filteredCount })}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            inline-flex items-center gap-2 px-3 py-2
            rounded-xl border text-sm font-medium
            transition-all
            ${hasActiveFilters 
              ? 'bg-primary-50 border-primary-200 text-primary-700' 
              : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }
          `}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">{t('explore:filters.petPolicy')}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </button>
        <Link
          to="/submit"
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">{t('common:nav.submit')}</span>
        </Link>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  )
}
