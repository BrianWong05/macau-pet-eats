import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { 
  ArrowLeft,
  MapPin,
  Utensils,
  Filter,
  X,
  Upload
} from 'lucide-react'
import { useRestaurants } from '@/hooks/useRestaurants'
import type { Restaurant, PetPolicy } from '@/types/database'
import { getLocalizedText } from '@/types/database'
import { PetPolicyBadge } from '@/components/PetPolicyBadge'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import 'leaflet/dist/leaflet.css'

// Custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Macau center coordinates
const MACAU_CENTER: [number, number] = [22.1987, 113.5439]

// Pet policy options
const PET_POLICY_OPTIONS: PetPolicy[] = [
  'indoors_allowed',
  'patio_only',
  'small_pets_only',
  'all_pets_welcome',
  'dogs_only',
  'cats_only'
]

export function Explore() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en' | 'pt'
  
  const [petPolicyFilter, setPetPolicyFilter] = useState<PetPolicy | null>(null)
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)

  const { restaurants, cuisineTypes, isLoading } = useRestaurants({
    petPolicyFilter,
    cuisineFilter
  })

  // Filter restaurants for display
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
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
            aria-label={t('restaurant.backToList')}
          >
            <ArrowLeft size={20} className="text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">
              {t('explore.title')}
            </h1>
            <p className="text-sm text-neutral-500 hidden sm:block">
              {t('explore.results', { count: filteredRestaurants.length })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              inline-flex items-center gap-2 px-3 py-2
              rounded-xl border text-sm font-medium
              transition-all
              ${hasActiveFilters 
                ? 'bg-primary-50 border-primary-200 text-primary-700' 
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }
            `}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">{t('explore.filters.petPolicy')}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </button>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">{t('nav.submit')}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
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
                {PET_POLICY_OPTIONS.map((policy) => (
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
                    {t(`petPolicy.${policy}`)}
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
      )}

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Restaurant List - Left Side */}
        <div className="w-full md:w-96 lg:w-[420px] bg-white border-r border-neutral-200 overflow-y-auto shrink-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-shimmer h-24 rounded-xl" />
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p>{t('explore.noResults')}</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantListItem
                  key={restaurant.id}
                  restaurant={restaurant}
                  lang={lang}
                  isSelected={selectedRestaurant === restaurant.id}
                  onSelect={() => setSelectedRestaurant(restaurant.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Map - Right Side */}
        <div className="hidden md:block flex-1 relative">
          <MapContainer
            center={MACAU_CENTER}
            zoom={14}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredRestaurants.map((restaurant) => (
              <Marker
                key={restaurant.id}
                position={[restaurant.latitude, restaurant.longitude]}
                icon={customIcon}
                eventHandlers={{
                  click: () => setSelectedRestaurant(restaurant.id)
                }}
              >
                <Popup>
                  <RestaurantPopup restaurant={restaurant} lang={lang} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

// Restaurant List Item Component
function RestaurantListItem({ 
  restaurant, 
  lang, 
  isSelected,
  onSelect 
}: { 
  restaurant: Restaurant
  lang: 'zh' | 'en' | 'pt'
  isSelected: boolean
  onSelect: () => void
}) {
  const name = getLocalizedText(restaurant, 'name', lang)
  const address = getLocalizedText(restaurant, 'address', lang)
  const cuisineType = getLocalizedText(restaurant, 'cuisine_type', lang)

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      onClick={onSelect}
      className={`
        block p-4 hover:bg-neutral-50 transition-colors
        ${isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : ''}
      `}
    >
      <div className="flex gap-4">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'}
          alt={name}
          className="w-20 h-20 rounded-xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate mb-1">
            {name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
            <Utensils size={14} />
            <span>{cuisineType}</span>
          </div>
          <PetPolicyBadge policy={restaurant.pet_policy} size="sm" />
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-2">
            <MapPin size={12} />
            <span className="truncate">{address}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Restaurant Popup Component for Map
function RestaurantPopup({ 
  restaurant, 
  lang 
}: { 
  restaurant: Restaurant
  lang: 'zh' | 'en' | 'pt'
}) {
  const { t } = useTranslation()
  const name = getLocalizedText(restaurant, 'name', lang)
  const cuisineType = getLocalizedText(restaurant, 'cuisine_type', lang)

  return (
    <div className="min-w-[200px]">
      <img
        src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300'}
        alt={name}
        className="w-full h-24 object-cover rounded-lg mb-2"
      />
      <h3 className="font-semibold text-neutral-900 mb-1">{name}</h3>
      <p className="text-sm text-neutral-500 mb-2">{cuisineType}</p>
      <Link
        to={`/restaurant/${restaurant.id}`}
        className="block w-full text-center px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
      >
        {t('explore.viewDetails')}
      </Link>
    </div>
  )
}
