import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, PawPrint } from 'lucide-react'
import { RestaurantCard } from '@/components/RestaurantCard'
import { SkeletonCardGrid } from '@/components/SkeletonCard'
import type { Restaurant } from '@/types/database'

interface FeaturedSectionProps {
  featuredRestaurants: Restaurant[]
  isLoading: boolean
  error: string | null
}

export function FeaturedSection({ featuredRestaurants, isLoading, error }: FeaturedSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            {t('home.featured.title')}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('home.featured.subtitle')}
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
                  {t('home.noResults.defaultHint')}
                </p>
              </div>
            )}
          </>
        )}

        {/* View All Button */}
        {featuredRestaurants.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/explore"
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
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
