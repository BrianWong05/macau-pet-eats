import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { PetPolicy, CuisineType } from '@/types/database'
import { LOCATION_AREAS, type LocationArea } from '@/hooks/useRestaurants'
import { usePetPolicies } from '@/contexts/PetPoliciesContext'

interface FilterPanelProps {
  petPolicyFilter: PetPolicy | null
  setPetPolicyFilter: (policy: PetPolicy | null) => void
  cuisineFilters: string[]
  toggleCuisineFilter: (cuisine: string) => void
  locationFilter?: LocationArea | null
  setLocationFilter?: (location: LocationArea | null) => void
  cuisineTypes: CuisineType[]
  clearFilters: () => void
  hasActiveFilters: boolean | null | string | number
}

export function FilterPanel({
  petPolicyFilter,
  setPetPolicyFilter,
  cuisineFilters,
  toggleCuisineFilter,
  locationFilter,
  setLocationFilter,
  cuisineTypes,
  clearFilters,
  hasActiveFilters
}: FilterPanelProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en' | 'pt'
  const { petPolicies, getPetPolicyDisplayName } = usePetPolicies()

  // Location names in different languages
  const getLocationName = (location: LocationArea) => {
    const names: Record<LocationArea, { zh: string; en: string; pt: string }> = {
      '澳門': { zh: '澳門', en: 'Macau', pt: 'Macau' },
      '氹仔': { zh: '氹仔', en: 'Taipa', pt: 'Taipa' },
      '路環': { zh: '路環', en: 'Coloane', pt: 'Coloane' }
    }
    return names[location][lang] || location
  }

  // Use DB policies if loaded, otherwise fallback
  const displayPolicies = petPolicies.length > 0 
    ? petPolicies.map(p => p.name as PetPolicy)
    : ['indoors_allowed', 'patio_only', 'small_pets_only', 'all_pets_welcome', 'dogs_only', 'cats_only', 'medium_dogs_allowed'] as PetPolicy[]

  return (
    <div className="border-t border-neutral-100 bg-white px-4 py-4 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Location Filter */}
        {setLocationFilter && (
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              {t('explore.filters.location') || '地區'}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLocationFilter(null)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${!locationFilter
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                {t('explore.filters.all')}
              </button>
              {LOCATION_AREAS.map((location) => (
                <button
                  key={location}
                  onClick={() => setLocationFilter(location)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${locationFilter === location
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }
                  `}
                >
                  {getLocationName(location)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pet Policy Filter */}
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-2 block">
            {t('explore.filters.petPolicy')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPetPolicyFilter(null)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${!petPolicyFilter
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }
              `}
            >
              {t('explore.filters.all')}
            </button>
            {displayPolicies.map((policy) => (
              <button
                key={policy}
                onClick={() => setPetPolicyFilter(policy)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${petPolicyFilter === policy
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                {getPetPolicyDisplayName(policy, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine Filter - Multi-select with toggle */}
        {cuisineTypes.length > 0 && (
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              {t('explore.filters.cuisine')} {cuisineFilters.length > 0 && `(${cuisineFilters.length})`}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  // Clear all cuisine filters
                  cuisineFilters.forEach(c => toggleCuisineFilter(c))
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${cuisineFilters.length === 0
                    ? 'bg-secondary-500 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                {t('explore.filters.all')}
              </button>
              {cuisineTypes.map((ct) => {
                const isSelected = cuisineFilters.includes(ct.name)
                return (
                  <button
                    key={ct.id}
                    onClick={() => toggleCuisineFilter(ct.name)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all
                      ${isSelected
                        ? 'bg-secondary-500 text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }
                    `}
                  >
                    {lang === 'zh' ? (ct.name_zh || ct.name) : 
                     lang === 'pt' ? (ct.name_pt || ct.name) : ct.name}
                  </button>
                )
              })}
              {/* Other option for custom cuisine types */}
              <button
                onClick={() => toggleCuisineFilter('__other__')}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${cuisineFilters.includes('__other__')
                    ? 'bg-secondary-500 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                {t('common.other') || '其他'}
              </button>
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700"
          >
            <X size={14} />
            {t('search.clearFilters')}
          </button>
        )}
      </div>
    </div>
  )
}
