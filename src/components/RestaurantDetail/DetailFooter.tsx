import { useTranslation } from 'react-i18next'

export function DetailFooter() {
  const { t } = useTranslation(['common'])

  return (
    <footer className="bg-white border-t border-neutral-200 py-8 mt-12">
      <div className="max-w-4xl mx-auto px-4 text-center text-neutral-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {t('common:appName')}. {t('common:allRightsReserved')}</p>
      </div>
    </footer>
  )
}
