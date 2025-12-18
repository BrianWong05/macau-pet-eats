import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'

export function CtaSection() {
  const { t } = useTranslation()

  return (
    <section className="py-20 bg-primary-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-sm mb-6 animate-bounce-slow">
          <Upload className="w-8 h-8 text-primary-500" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          {t('home.cta.title')}
        </h2>
        <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
          {t('home.cta.subtitle')}
        </p>
        <Link
          to="/submit"
          className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white font-bold text-lg rounded-xl hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <Upload className="w-5 h-5" />
          {t('home.cta.button')}
        </Link>
      </div>
    </section>
  )
}
