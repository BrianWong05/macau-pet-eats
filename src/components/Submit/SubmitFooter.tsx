import { useTranslation } from 'react-i18next'
import { PawPrint } from 'lucide-react'

export function SubmitFooter() {
  const { t } = useTranslation()

  return (
    <footer className="bg-neutral-900 text-neutral-400 py-8 mt-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <PawPrint className="w-5 h-5 text-primary-400" />
          <span className="font-semibold text-white">{t('common.appName')}</span>
        </div>
        <p className="text-sm">{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}
