import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, X, List } from 'lucide-react'

interface SearchBarProps {
  initialValue?: string
}

export function SearchBar({
  initialValue = '',
}: SearchBarProps) {
  const { t } = useTranslation(['common', 'home'])
  const navigate = useNavigate()
  const [value, setValue] = useState(initialValue)

  const handleClear = useCallback(() => {
    setValue('')
  }, [])

  const handleSearch = useCallback(() => {
    // Navigate to search page with query
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value)}`)
    }
  }, [value, navigate])

  const handleViewAll = useCallback(() => {
    // Navigate to search page to show all restaurants
    navigate('/search')
  }, [navigate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      handleSearch()
    }
  }, [value, handleSearch])

  return (
    <div className="flex items-center gap-3 w-full max-w-2xl">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('home:searchPlaceholder')}
          className="
            w-full pl-12 pr-12 py-4
            text-lg
            bg-white
            border-2 border-neutral-200
            rounded-2xl
            shadow-soft
            placeholder:text-neutral-400
            focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100
            transition-all duration-200
          "
        />
        
        {value && (
          <button
            onClick={handleClear}
            className="
              absolute inset-y-0 right-0 pr-4
              flex items-center
              text-neutral-400 hover:text-neutral-600
              transition-colors
            "
            aria-label={t('common:close')}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* View All Button */}
      <button
        onClick={handleViewAll}
        className="
          flex items-center justify-center
          w-14 h-14 sm:w-auto sm:px-6 sm:py-4
          bg-primary-500 hover:bg-primary-600
          text-white font-semibold
          rounded-2xl
          shadow-lg hover:shadow-xl
          transition-all duration-200
          focus:outline-none focus:ring-4 focus:ring-primary-200
          active:scale-95
        "
        aria-label={t('common:viewAll')}
      >
        <List className="h-5 w-5 sm:mr-2" />
        <span className="hidden sm:inline">{t('common:viewAll')}</span>
      </button>
    </div>
  )
}


