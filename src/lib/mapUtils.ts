export function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  // Pattern for URLs like: https://maps.google.com/?q=22.1937,113.5399
  // Or: https://www.google.com/maps/place/.../@22.1937,113.5399,17z
  // Or: https://goo.gl/maps/... (won't work without API)
  
  const patterns = [
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,  // @lat,lng format
    /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,  // ?q=lat,lng format
    /place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/,  // place/lat,lng format
    /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,  // !3d...!4d... format
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
