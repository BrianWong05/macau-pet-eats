import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRestaurants } from '@/hooks/useRestaurants'
import type { PetPolicy } from '@/types/database'
import { ExploreHeader } from '@/components/Explore/ExploreHeader'
import { FilterBar } from '@/components/Explore/FilterBar'
import { RestaurantList } from '@/components/Explore/RestaurantList'
import { MapView } from '@/components/Explore/MapView'

export function Explore() {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en' | 'pt'
  
  const [petPolicyFilter, setPetPolicyFilter] = useState<PetPolicy | null>(null)
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)

  const { restaurants, cuisineTypes, isLoading } = useRestaurants({
    petPolicyFilter,
    cuisineFilter
  })

  // Filter restaurants for display - redundant if hook handles it, but keeping structure safe
  const filteredRestaurants = useMemo(() => {
    return restaurants
  }, [restaurants])

  const clearFilters = () => {
    setPetPolicyFilter(null)
    setCuisineFilter(null)
  }

  const hasActiveFilters = petPolicyFilter || cuisineFilter

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <ExploreHeader
        filteredCount={filteredRestaurants.length}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {showFilters && (
        <FilterBar
          petPolicyFilter={petPolicyFilter}
          setPetPolicyFilter={setPetPolicyFilter}
          cuisineFilter={cuisineFilter}
          setCuisineFilter={setCuisineFilter}
          cuisineTypes={cuisineTypes}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        <RestaurantList
          isLoading={isLoading}
          filteredRestaurants={filteredRestaurants}
          selectedRestaurant={selectedRestaurant}
          onSelectRestaurant={setSelectedRestaurant}
          lang={lang}
        />

        <MapView
          filteredRestaurants={filteredRestaurants}
          onSelectRestaurant={setSelectedRestaurant}
          lang={lang}
        />
      </div>
    </div>
  )
}
