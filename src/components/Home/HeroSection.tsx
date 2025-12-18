import { useTranslation } from 'react-i18next'
import { PawPrint, Sparkles, MapPin } from 'lucide-react'
import { SearchBar } from '@/components/SearchBar'

export function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-soft mb-8">
            <PawPrint className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-neutral-700">
              {t('home.badge')}
            </span>
            <Sparkles className="w-4 h-4 text-primary-400" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            {t('home.headline')}{' '}
            <span className="text-gradient">{t('home.headlineHighlight')}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('home.subheadline')}
          </p>

          {/* Search Bar */}
          <div className="flex justify-center">
            <SearchBar />
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="flex items-center gap-2 text-neutral-600">
              <MapPin className="w-5 h-5 text-primary-500" />
              <span className="font-medium">{t('home.stats.locations')}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <PawPrint className="w-5 h-5 text-secondary-500" />
              <span className="font-medium">{t('home.stats.allPets')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
