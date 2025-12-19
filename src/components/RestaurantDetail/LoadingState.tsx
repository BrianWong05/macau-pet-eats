import { useTranslation } from 'react-i18next'

export function LoadingState() {
  const { t } = useTranslation(['common'])
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="h-64 md:h-96 animate-shimmer" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-neutral-500 font-medium">{t('common:loading')}</p>
        </div>
      </div>
    </div>
  )
}
