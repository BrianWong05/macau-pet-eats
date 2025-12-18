import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

interface ErrorStateProps {
  error: string
}

export function ErrorState({ error }: ErrorStateProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">
          {t('errors.loadingRestaurants')}
        </h1>
        <p className="text-neutral-600 mb-6">{error}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
        >
          <ArrowLeft size={18} />
          {t('restaurant.backToList')}
        </Link>
      </div>
    </div>
  )
}
