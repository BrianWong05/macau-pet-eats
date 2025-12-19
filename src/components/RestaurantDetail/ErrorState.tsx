import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface ErrorStateProps {
  error: string
}

export function ErrorState({ error }: ErrorStateProps) {
  const { t } = useTranslation(['common'])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">
          {t('common:errors.loadingRestaurants')}
        </h1>
        <p className="text-neutral-600 mb-6 max-w-md">{error}</p>
        <Link
          to="/"
          className="px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
        >
          {t('common:backToHome')}
        </Link>
      </div>
    </div>
  )
}
