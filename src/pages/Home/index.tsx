import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PawPrint, Sparkles, MapPin, Upload } from 'lucide-react'
import { SearchBar } from '@/components/SearchBar'
import { RestaurantCard } from '@/components/RestaurantCard'
import { SkeletonCardGrid } from '@/components/SkeletonCard'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useRestaurants } from '@/hooks/useRestaurants'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { User, LogOut } from 'lucide-react'

export function Home() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { featuredRestaurants, isLoading, error } = useRestaurants({ searchQuery })

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Header with Language Switcher */}
      <header className="absolute top-0 right-0 p-4 z-50 flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-700 hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all text-neutral-600 hover:text-red-600"
              title={t('auth.logout') || 'Logout'}
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all text-neutral-700 font-medium"
          >
            <User size={18} />
            <span>{t('auth.login') || 'Login'}</span>
          </button>

        )}
        <Link
          to="/submit"
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all text-neutral-700 font-medium"
        >
          <Upload size={18} />
          <span className="hidden sm:inline">{t('nav.submit')}</span>
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Hero Section */}
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
              <SearchBar onSearch={handleSearch} />
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

      {/* Featured Restaurants Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              {searchQuery ? t('home.featured.searchTitle') : t('home.featured.title')}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {searchQuery 
                ? t('home.featured.searchSubtitle', { query: searchQuery })
                : t('home.featured.subtitle')
              }
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-red-50 text-red-700 rounded-xl">
                <span className="font-medium">{t('errors.loadingRestaurants')}:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <SkeletonCardGrid count={6} />}

          {/* Restaurant Grid */}
          {!isLoading && !error && (
            <>
              {featuredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredRestaurants.map((restaurant, index) => (
                    <div
                      key={restaurant.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <RestaurantCard restaurant={restaurant} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <PawPrint className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                    {t('home.noResults.title')}
                  </h3>
                  <p className="text-neutral-500">
                    {searchQuery 
                      ? t('home.noResults.searchHint')
                      : t('home.noResults.defaultHint')
                    }
                  </p>
                </div>
              )}
            </>
          )}

          {/* View All Button */}
          {!searchQuery && featuredRestaurants.length > 0 && (
            <div className="text-center mt-12">
              <a
                href="/explore"
                className="
                  inline-flex items-center gap-2 px-8 py-4
                  bg-primary-500 hover:bg-primary-600
                  text-white font-semibold text-lg
                  rounded-xl shadow-lg hover:shadow-xl
                  transition-all duration-200
                  focus:outline-none focus:ring-4 focus:ring-primary-200
                "
              >
                <MapPin className="w-5 h-5" />
                {t('home.exploreButton')}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Submit CTA Section */}
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
          <a
            href="/submit"
            className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white font-bold text-lg rounded-xl hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Upload className="w-5 h-5" />
            {t('home.cta.button')}
          </a>
        </div>
      </section>

      {/* Footer */}
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

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  )
}
