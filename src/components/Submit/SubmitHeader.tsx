import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface SubmitHeaderProps {
  isScrolled: boolean
}

export function SubmitHeader({ isScrolled }: SubmitHeaderProps) {
  const { t } = useTranslation(['submit', 'restaurant'])

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b
        ${isScrolled ? 'bg-white/90 backdrop-blur-md border-neutral-200 py-3 shadow-sm' : 'bg-white border-neutral-200 py-4'}
      `}
    >
      <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
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
              {t('submit:title')}
            </h1>
            <p className="text-sm text-neutral-500 hidden sm:block">
              {t('submit:subtitle')}
            </p>
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  )
}
