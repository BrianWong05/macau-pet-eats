export function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  // Pattern for URLs like: https://maps.google.com/?q=22.1937,113.5399
  // Or: https://www.google.com/maps/place/.../@22.1937,113.5399,17z
  // Or: https://goo.gl/maps/... (won't work without API)
  
  const patterns = [
    /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,  // !3d...!4d... format (ACTUAL place coords, check first!)
    /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,  // ?q=lat,lng format
    /place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/,  // place/lat,lng format
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,  // @lat,lng format (viewport center, check last)
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      const lat = parseFloat(match[1])
      const lng = parseFloat(match[2])
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng }
      }
    }
  }
  return null
}

// Extract place query from Google Maps URL for embedding
export function extractPlaceFromUrl(url: string): string | null {
  // Try to extract place name from /place/<name>/ pattern
  const placeMatch = url.match(/\/place\/([^/@]+)/)
  if (placeMatch) {
    return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
  }
  // Try to extract from ?q= parameter
  const queryMatch = url.match(/[?&]q=([^&]+)/)
  if (queryMatch) {
    return decodeURIComponent(queryMatch[1].replace(/\+/g, ' '))
  }
  return null
}

// Extract Place ID from Google Maps URL (format: !1s0x...!...)
export function extractPlaceIdFromUrl(url: string): string | null {
  // Match the Place ID pattern in Google Maps URLs
  const placeIdMatch = url.match(/!1s(0x[a-f0-9]+:0x[a-f0-9]+)/)
  if (placeIdMatch) {
    return placeIdMatch[1]
  }
  return null
}

export function getGoogleMapsEmbedSrc(
  url: string | null, 
  lat: number, 
  lng: number,
  restaurantName?: string
): string {
  // First, try to extract Place ID from URL - this is the most reliable identifier
  if (url) {
    const placeId = extractPlaceIdFromUrl(url)
    if (placeId) {
      // Use place ID in CID format for embed
      // Convert hex to decimal for CID
      const cidMatch = placeId.match(/:0x([a-f0-9]+)$/)
      if (cidMatch) {
        const cid = BigInt('0x' + cidMatch[1]).toString()
        return `https://maps.google.com/maps?cid=${cid}&z=17&output=embed&hl=zh-TW`
      }
    }
    
    // Fallback to place name from URL
    const placeName = extractPlaceFromUrl(url)
    if (placeName) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&ll=${lat},${lng}&z=17&output=embed&hl=zh-TW`
    }
  }
  
  // If we have a restaurant name, use it with coordinates
  if (restaurantName) {
    const searchQuery = `${restaurantName} Macau`
    return `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&ll=${lat},${lng}&z=17&output=embed&hl=zh-TW`
  }
  
  // Fallback to coordinates only
  return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=zh-TW`
}
