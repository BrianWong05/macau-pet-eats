import { useTranslation } from 'react-i18next'

export function DetailFooter() {
  const { t } = useTranslation()

  return (
    <footer className="bg-neutral-900 text-neutral-400 py-8 mt-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-sm">{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}
