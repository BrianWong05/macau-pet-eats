import { useState, useCallback } from 'react'
import { PawPrint, Sparkles, MapPin } from 'lucide-react'
import { SearchBar } from '@/components/SearchBar'
import { RestaurantCard } from '@/components/RestaurantCard'
import { SkeletonCardGrid } from '@/components/SkeletonCard'
import { useRestaurants } from '@/hooks/useRestaurants'

export function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const { featuredRestaurants, isLoading, error } = useRestaurants({ searchQuery })

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  return (
    <div className="min-h-screen">
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
                Macau's #1 Pet-Friendly Dining Guide
              </span>
              <Sparkles className="w-4 h-4 text-primary-400" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Find the Best Places to Dine with Your{' '}
              <span className="text-gradient">Furry Friend</span>{' '}
              in Macau
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover pet-friendly restaurants, cafés, and bars across Macau. 
              From cozy patios to fully indoor-friendly spots.
            </p>

            {/* Search Bar */}
            <div className="flex justify-center">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="flex items-center gap-2 text-neutral-600">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span className="font-medium">50+ Locations</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <PawPrint className="w-5 h-5 text-secondary-500" />
                <span className="font-medium">All Pet Types Welcome</span>
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
              {searchQuery ? 'Search Results' : 'Featured Restaurants'}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {searchQuery 
                ? `Showing results for "${searchQuery}"`
                : 'Hand-picked spots where you and your pet are always welcome'
              }
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-red-50 text-red-700 rounded-xl">
                <span className="font-medium">Error loading restaurants:</span>
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
                    No restaurants found
                  </h3>
                  <p className="text-neutral-500">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Check back soon for new additions!'
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
                Explore All on Map
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <PawPrint className="w-6 h-6 text-primary-400" />
              <span className="font-semibold text-white">Macau Pet Eats</span>
            </div>
            <p className="text-sm">
              © 2024 Macau Pet-Friendly Eats. Made with 🐾 for pet lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
