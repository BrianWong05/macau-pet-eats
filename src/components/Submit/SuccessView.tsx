import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'lucide-react'

interface SuccessViewProps {
  onReset: () => void
}

export function SuccessView({ onReset }: SuccessViewProps) {
  const { t } = useTranslation(['submit', 'common'])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-secondary-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">
          {t('submit:successTitle')}
        </h1>
        <p className="text-neutral-600 mb-8">
          {t('submit:successMessage')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            {t('submit:backToHome')}
          </Link>
          <button
            onClick={onReset}
            className="px-6 py-3 bg-white border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
          >
            {t('common:nav.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
