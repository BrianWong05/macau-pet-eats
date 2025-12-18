import { useTranslation } from 'react-i18next'
import { PawPrint } from 'lucide-react'

export function HomeFooter() {
  const { t } = useTranslation()

  return (
    <footer className="bg-neutral-900 text-neutral-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-primary-400" />
            <span className="font-semibold text-white">{t('common.appName')}</span>
          </div>
          <p className="text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
