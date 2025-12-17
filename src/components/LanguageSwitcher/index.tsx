import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown } from 'lucide-react'
import { supportedLanguages } from '@/lib/i18n'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = supportedLanguages.find((lang) => lang.code === i18n.language) 
    || supportedLanguages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          inline-flex items-center gap-2 px-3 py-2
          bg-white/80 hover:bg-white
          border border-neutral-200
          rounded-xl shadow-soft
          text-sm font-medium text-neutral-700
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-300
        "
        aria-label="Select language"
      >
        <Globe size={16} className="text-neutral-500" />
        <span>{currentLang.name}</span>
        <ChevronDown 
          size={14} 
          className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="
          absolute right-0 mt-2 w-40
          bg-white rounded-xl shadow-elevated
          border border-neutral-100
          py-2 z-50
          animate-fade-in
        ">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full px-4 py-2.5
                text-left text-sm
                transition-colors
                ${lang.code === i18n.language
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-neutral-700 hover:bg-neutral-50'
                }
              `}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
