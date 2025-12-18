import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Restaurant } from '@/types/database'
import { MapPopup } from './MapPopup'

// Manual fix for leaflet marker icons
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const MACAU_CENTER: [number, number] = [22.1987, 113.5439]

interface MapViewProps {
  filteredRestaurants: Restaurant[]
  onSelectRestaurant: (id: string) => void
  lang: 'zh' | 'en' | 'pt'
}

export function MapView({ 
  filteredRestaurants, 
  onSelectRestaurant,
  lang 
}: MapViewProps) {
  return (
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
              click: () => onSelectRestaurant(restaurant.id)
            }}
          >
            <Popup>
              <MapPopup restaurant={restaurant} lang={lang} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
