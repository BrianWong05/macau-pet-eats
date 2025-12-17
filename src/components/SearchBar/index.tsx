import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  initialValue?: string
  debounceMs?: number
}

export function SearchBar({
  onSearch,
  initialValue = '',
  debounceMs = 300,
}: SearchBarProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState(initialValue)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [value, onSearch, debounceMs])

  const handleClear = useCallback(() => {
    setValue('')
  }, [])

  return (
    <div className="relative w-full max-w-2xl">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-neutral-400" />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('home.searchPlaceholder')}
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
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
