import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { PetPolicy, CuisineType } from '@/types/database'

import { usePetPolicies } from '@/contexts/PetPoliciesContext'

interface FilterBarProps {
  petPolicyFilter: PetPolicy | null
  setPetPolicyFilter: (policy: PetPolicy | null) => void
  cuisineFilter: string | null
  setCuisineFilter: (cuisine: string | null) => void
  cuisineTypes: CuisineType[]
  clearFilters: () => void
  hasActiveFilters: boolean | null | string
}

export function FilterBar({
  petPolicyFilter,
  setPetPolicyFilter,
  cuisineFilter,
  setCuisineFilter,
  cuisineTypes,
  clearFilters,
  hasActiveFilters
}: FilterBarProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en' | 'pt'
  const { petPolicies, getPetPolicyDisplayName } = usePetPolicies()
  
  const displayPolicies: PetPolicy[] = petPolicies.length > 0
    ? petPolicies.map(p => p.name as PetPolicy)
    : ['indoors_allowed', 'patio_only', 'small_pets_only', 'all_pets_welcome', 'dogs_only', 'cats_only', 'medium_dogs_allowed']

  return (
    <div className="bg-white border-b border-neutral-200 px-4 py-4 shrink-0 z-10 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Pet Policy Filter */}
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-2 block">
            {t('explore.filters.petPolicy')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPetPolicyFilter(null)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium
                transition-all
                ${!petPolicyFilter
                  ? 'bg-primary-500 text-white'
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
                  px-3 py-1.5 rounded-full text-sm font-medium
                  transition-all
                  ${petPolicyFilter === policy
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                {getPetPolicyDisplayName(policy, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine Filter */}
        {cuisineTypes.length > 0 && (
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              {t('explore.filters.cuisine')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCuisineFilter(null)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium
                  transition-all
                  ${!cuisineFilter
                    ? 'bg-secondary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                {t('explore.filters.all')}
              </button>
              {cuisineTypes.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => setCuisineFilter(ct.name)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium
                    transition-all
                    ${cuisineFilter === ct.name
                      ? 'bg-secondary-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }
                  `}
                >
                  {lang === 'zh' ? (ct.name_zh || ct.name) : 
                   lang === 'pt' ? (ct.name_pt || ct.name) : ct.name}
                </button>
              ))}
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
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
