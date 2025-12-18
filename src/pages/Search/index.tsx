import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useRestaurants } from '@/hooks/useRestaurants'
import type { PetPolicy } from '@/types/database'
import { SearchHeader } from '@/components/Search/SearchHeader'
import { FilterPanel } from '@/components/Search/FilterPanel'
import { SearchResults } from '@/components/Search/SearchResults'

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get initial query from URL
  const initialQuery = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [petPolicyFilter, setPetPolicyFilter] = useState<PetPolicy | null>(null)
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { restaurants, cuisineTypes, isLoading } = useRestaurants({
    searchQuery: debouncedQuery,
    petPolicyFilter,
    cuisineFilter
  })

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      // Update URL with search query
      if (searchQuery) {
        setSearchParams({ q: searchQuery })
      } else {
        setSearchParams({})
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, setSearchParams])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setDebouncedQuery('')
    setSearchParams({})
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setPetPolicyFilter(null)
    setCuisineFilter(null)
  }, [])

  const hasActiveFilters = petPolicyFilter || cuisineFilter

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 bg-white border-b border-neutral-200 z-20">
        <SearchHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleClearSearch={handleClearSearch}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
        />
        
        {showFilters && (
          <FilterPanel
            petPolicyFilter={petPolicyFilter}
            setPetPolicyFilter={setPetPolicyFilter}
            cuisineFilter={cuisineFilter}
            setCuisineFilter={setCuisineFilter}
            cuisineTypes={cuisineTypes}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        )}
      </header>

      <SearchResults 
        restaurants={restaurants}
        isLoading={isLoading}
        searchQuery={searchQuery}
        handleClearSearch={handleClearSearch}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  )
}
