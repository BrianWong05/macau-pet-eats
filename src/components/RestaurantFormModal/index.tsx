import { useState, useEffect, useRef } from 'react'
import { X, Loader, Upload, Image as ImageIcon, MapPin, Link as LinkIcon, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import type { Restaurant, DayOfWeek, OpeningHours, DayHours } from '@/types/database'

const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']



interface RestaurantFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  restaurant?: Restaurant | null
}

const CUISINE_TYPES = [
  'Portuguese',
  'Macanese',
  'Chinese',
  'Japanese',
  'Italian',
  'American',
  'Cafe',
  'Bar',
  'Dessert',
  'Other'
]

const PET_POLICIES = [
  'indoors_allowed',
  'patio_only',
  'small_pets_only',
  'all_pets_welcome',
  'dogs_only',
  'cats_only'
]

// Function to extract coordinates from Google Maps URL
function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
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
function extractPlaceFromUrl(url: string): string | null {
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

export function RestaurantFormModal({ isOpen, onClose, onSave, restaurant }: RestaurantFormModalProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapsUrl, setMapsUrl] = useState('')
  
  // Image State
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Menu Image State
  const [menuFiles, setMenuFiles] = useState<File[]>([])
  const [menuPreviews, setMenuPreviews] = useState<string[]>([])
  const menuInputRef = useRef<HTMLInputElement>(null)

  const handleMapsUrlChange = (url: string) => {
    setMapsUrl(url)
    const coords = extractCoordsFromUrl(url)
    if (coords) {
      setFormData(prev => ({ 
        ...prev, 
        latitude: coords.lat, 
        longitude: coords.lng,
        google_maps_url: url  // Save the URL to formData
      }))
      toast.success('Location extracted from URL!')
    } else if (url) {
      // Even if coords can't be extracted, still save the URL
      setFormData(prev => ({ ...prev, google_maps_url: url }))
    }
  }

  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: '',
    name_zh: '',
    name_pt: '',
    address: '',
    address_zh: '',
    address_pt: '',
    description: '',
    description_zh: '',
    description_pt: '',
    pet_policy: 'patio_only',
    cuisine_type: '',
    contact_info: '',
    image_url: '',
    gallery_images: [],
    menu_images: [],
    latitude: 22.1937,
    longitude: 113.5399,
    status: 'approved'
  })

  useEffect(() => {
    if (restaurant) {
      setFormData(restaurant)
      // Initialize previews with existing images if any (from gallery_images)
      // For now, we only have persisted URLs. We can mix them or valid files.
      // Ideally, we treat existing URLs separately from new files.
      setImagePreviews(restaurant.gallery_images || [])
      // Load existing Google Maps URL if present
      setMapsUrl(restaurant.google_maps_url || '')
      // If we want to show the main image as part of the gallery or separate?
      // "Upload multiple images" usually implies a gallery.
      // Let's assume we are editing gallery_images.
      // But we also have image_url (main image).
      // Let's keep image_url as main, and gallery_images as additional.
      // OR, user implies replacing single upload with multiple.
      // Let's support uploading to gallery_images.
      // Load existing menu images
      setMenuPreviews(restaurant.menu_images || [])
    } else {
      setFormData({
        name: '',
        name_zh: '',
        name_pt: '',
        address: '',
        address_zh: '',
        address_pt: '',
        description: '',
        description_zh: '',
        description_pt: '',
        pet_policy: 'patio_only',
        cuisine_type: '',
        contact_info: '',
        image_url: '',
        gallery_images: [],
        menu_images: [],
        latitude: 22.1937,
        longitude: 113.5399,
        status: 'approved'
      })
      setImagePreviews([])
      setMenuPreviews([])
    }
    setImageFiles([])
    setMenuFiles([])
  }, [restaurant, isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Validate sizes
      const validFiles = files.filter(file => {
        if (file.size > 2 * 1024 * 1024) {
          toast.error(`Image ${file.name} is too large (max 2MB)`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      setImageFiles(prev => [...prev, ...validFiles])

      // Generate previews
      validFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    // Check if index corresponds to existing URL or new file
    // Current strategy: merge everything into imagePreviews for display
    // But we need to separate existing vs new for deletion logic
    // Simplified: We verify if it is a new file or existing URL based on formData
    
    // Actually, simpler approach:
    // Keep formData.gallery_images as "saved images"
    // Keep imageFiles as "new images to upload"
    // imagePreviews can be derived or state?
    // Let's modify: 
    // If index < formData.gallery_images.length (if we assume previews order = existing + new)
    // But we initialized previews with ALL.
    
    // Let's reconstruct removal:
    // If removing an existing image (from formData.gallery_images)
    // If removing a new image (from imageFiles)
    
    // Let's assume imagePreviews maps 1:1 to [ ...formData.gallery_images, ...newFilesPreviews ]
    const existingCount = (formData.gallery_images || []).length
    
    if (index < existingCount) {
      // Removing existing image
      const newGallery = [...(formData.gallery_images || [])]
      newGallery.splice(index, 1)
      setFormData(prev => ({ ...prev, gallery_images: newGallery }))
      
      // Also update previews (which we initialized with existing)
      setImagePreviews(prev => prev.filter((_, i) => i !== index))
    } else {
      // Removing new file
      const newFileIndex = index - existingCount
      setImageFiles(prev => prev.filter((_, i) => i !== newFileIndex))
      setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleMenuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (file.size > 2 * 1024 * 1024) {
          toast.error(`Image ${file.name} is too large (max 2MB)`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      setMenuFiles(prev => [...prev, ...validFiles])

      validFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setMenuPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeMenu = (index: number) => {
    const existingCount = (formData.menu_images || []).length
    
    if (index < existingCount) {
      const newMenuImages = [...(formData.menu_images || [])]
      newMenuImages.splice(index, 1)
      setFormData(prev => ({ ...prev, menu_images: newMenuImages }))
      setMenuPreviews(prev => prev.filter((_, i) => i !== index))
    } else {
      const newFileIndex = index - existingCount
      setMenuFiles(prev => prev.filter((_, i) => i !== newFileIndex))
      setMenuPreviews(prev => prev.filter((_, i) => i !== index))
    }
    
    if (menuInputRef.current) {
      menuInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const uploadedUrls: string[] = []

      // Upload new images
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
          const filePath = `${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('restaurants')
            .upload(filePath, file)

          if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

          const { data: { publicUrl } } = supabase.storage
            .from('restaurants')
            .getPublicUrl(filePath)
            
          uploadedUrls.push(publicUrl)
        }
      }

      // Merge with existing images
      const finalGalleryImages = [
        ...(formData.gallery_images || []),
        ...uploadedUrls
      ]
      
      // Ensure image_url (main image) is set too. Use first gallery image if available.
      let mainImageUrl = formData.image_url
      if (!mainImageUrl && finalGalleryImages.length > 0) {
        mainImageUrl = finalGalleryImages[0]
      }
      // If user removed main image but has others?
      // For now, if image_url is empty, take the first one. 
      // Or we can let user select main image? 
      // Simplest: Always sync image_url to first image of gallery if gallery exists.
      if (finalGalleryImages.length > 0) {
         mainImageUrl = finalGalleryImages[0]
      }

      // Upload new menu images
      const uploadedMenuUrls: string[] = []
      if (menuFiles.length > 0) {
        for (const file of menuFiles) {
          const fileExt = file.name.split('.').pop()
          const fileName = `menu_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
          const filePath = `${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('restaurants')
            .upload(filePath, file)

          if (uploadError) throw new Error(`Menu upload failed: ${uploadError.message}`)

          const { data: { publicUrl } } = supabase.storage
            .from('restaurants')
            .getPublicUrl(filePath)
            
          uploadedMenuUrls.push(publicUrl)
        }
      }

      // Merge with existing menu images
      const finalMenuImages = [
        ...(formData.menu_images || []),
        ...uploadedMenuUrls
      ]

      const dataToSave = {
        ...formData,
        gallery_images: finalGalleryImages,
        menu_images: finalMenuImages,
        image_url: mainImageUrl || ''
      }

      if (restaurant?.id) {
        // Update
        const { error } = await supabase
          .from('restaurants')
          .update(dataToSave as never)
          .eq('id', restaurant.id)
        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('restaurants')
          .insert(dataToSave as never)
        if (error) throw error
      }
      onSave()
      onClose()
      toast.success(restaurant ? 'Restaurant updated successfully' : 'Restaurant created successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-100 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-neutral-900">
            {restaurant ? 'Edit Restaurant' : 'Add Restaurant'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.nameEn')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.nameZh')}</label>
                <input
                  type="text"
                  value={formData.name_zh || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_zh: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.namePt')}</label>
                <input
                  type="text"
                  value={formData.name_pt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_pt: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.cuisineType')} *</label>
                <select
                  required
                  value={formData.cuisine_type || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, cuisine_type: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t('admin.modal.placeholders.selectCuisine')}</option>
                  {CUISINE_TYPES.map(type => (
                    <option key={type} value={type}>{t(`cuisineTypes.${type.toLowerCase()}`) || type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.petPolicy')} *</label>
                <select
                  required
                  value={formData.pet_policy || 'patio_only'}
                  onChange={(e) => setFormData(prev => ({ ...prev, pet_policy: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  {PET_POLICIES.map(policy => (
                    <option key={policy} value={policy}>{t(`petPolicy.${policy}`)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.status')}</label>
                <select
                  value={formData.status || 'pending'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pending">{t('admin.restaurants.status.pending')}</option>
                  <option value="approved">{t('admin.restaurants.status.approved')}</option>
                  <option value="rejected">{t('admin.restaurants.status.rejected')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.descriptionEn')} *</label>
              <textarea
                required
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder={t('admin.modal.placeholders.description')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.descriptionZh')}</label>
              <textarea
                rows={3}
                value={formData.description_zh || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description_zh: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder={t('admin.modal.placeholders.description') + ' (中文)'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.descriptionPt')}</label>
              <textarea
                rows={3}
                value={formData.description_pt || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description_pt: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder={t('admin.modal.placeholders.description') + ' (葡文)'}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.addressEn')} *</label>
              <input
                type="text"
                required
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder={t('admin.modal.placeholders.address')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.addressZh')}</label>
              <input
                type="text"
                value={formData.address_zh || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address_zh: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder={t('admin.modal.placeholders.address') + ' (中文)'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.addressPt')}</label>
              <input
                type="text"
                value={formData.address_pt || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address_pt: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder={t('admin.modal.placeholders.address') + ' (葡文)'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.contactInfo')}</label>
            <input
              type="tel"
              value={formData.contact_info || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="+853 xxxx xxxx"
            />
          </div>

          {/* Social Media */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-700">
              {t('restaurant.socialMedia.title')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">{t('restaurant.socialMedia.facebook')}</label>
                <input
                  type="url"
                  value={(formData.social_media as {facebook?: string})?.facebook || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    social_media: { ...(prev.social_media as object || {}), facebook: e.target.value || undefined }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">{t('restaurant.socialMedia.instagram')}</label>
                <input
                  type="url"
                  value={(formData.social_media as {instagram?: string})?.instagram || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    social_media: { ...(prev.social_media as object || {}), instagram: e.target.value || undefined }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">{t('restaurant.socialMedia.website')}</label>
                <input
                  type="url"
                  value={(formData.social_media as {website?: string})?.website || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    social_media: { ...(prev.social_media as object || {}), website: e.target.value || undefined }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <Clock size={16} className="text-primary-500" />
              {t('openingHours.title')}
            </label>
            <div className="space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const hours = (formData.opening_hours as OpeningHours)?.[day]
                const isOpen = hours !== null && hours !== undefined
                
                return (
                  <div key={day} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-neutral-600">
                      {t(`openingHours.days.${day}`)}
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isOpen}
                        onChange={(e) => {
                          const newHours = { ...(formData.opening_hours as OpeningHours || {}) }
                          if (e.target.checked) {
                            newHours[day] = { open: '09:00', close: '22:00' }
                          } else {
                            newHours[day] = null
                          }
                          setFormData(prev => ({ ...prev, opening_hours: newHours }))
                        }}
                        className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                      />
                    </label>
                    {isOpen ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={(hours as DayHours)?.open || '09:00'}
                          onChange={(e) => {
                            const newHours = { ...(formData.opening_hours as OpeningHours || {}) }
                            newHours[day] = { ...(newHours[day] as DayHours || {}), open: e.target.value }
                            setFormData(prev => ({ ...prev, opening_hours: newHours }))
                          }}
                          className="px-2 py-1 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-neutral-400">-</span>
                        <input
                          type="time"
                          value={(hours as DayHours)?.close || '22:00'}
                          onChange={(e) => {
                            const newHours = { ...(formData.opening_hours as OpeningHours || {}) }
                            newHours[day] = { ...(newHours[day] as DayHours || {}), close: e.target.value }
                            setFormData(prev => ({ ...prev, opening_hours: newHours }))
                          }}
                          className="px-2 py-1 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        {/* Batch apply button for this row */}
                        <div className="flex gap-1 ml-2">
                          <button
                            type="button"
                            onClick={() => {
                              const currentHours = (formData.opening_hours as OpeningHours)?.[day] as DayHours
                              if (!currentHours) return
                              const weekdays: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
                              const newHours = { ...(formData.opening_hours as OpeningHours || {}) }
                              weekdays.forEach(d => { newHours[d] = { ...currentHours } })
                              setFormData(prev => ({ ...prev, opening_hours: newHours }))
                            }}
                            className="px-2 py-0.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded transition-colors"
                          >
                            {t('openingHours.applyToWeekdays')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentHours = (formData.opening_hours as OpeningHours)?.[day] as DayHours
                              if (!currentHours) return
                              const weekend: DayOfWeek[] = ['saturday', 'sunday']
                              const newHours = { ...(formData.opening_hours as OpeningHours || {}) }
                              weekend.forEach(d => { newHours[d] = { ...currentHours } })
                              setFormData(prev => ({ ...prev, opening_hours: newHours }))
                            }}
                            className="px-2 py-0.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded transition-colors"
                          >
                            {t('openingHours.applyToWeekend')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentHours = (formData.opening_hours as OpeningHours)?.[day] as DayHours
                              if (!currentHours) return
                              const newHours = { ...(formData.opening_hours as OpeningHours || {}) }
                              DAYS_OF_WEEK.forEach(d => { newHours[d] = { ...currentHours } })
                              setFormData(prev => ({ ...prev, opening_hours: newHours }))
                            }}
                            className="px-2 py-0.5 text-xs bg-primary-100 hover:bg-primary-200 text-primary-600 rounded transition-colors"
                          >
                            {t('openingHours.applyToAll')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">{t('openingHours.closed')}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <MapPin size={16} className="text-primary-500" />
                {t('admin.modal.labels.location')} *
              </label>
              <span className="text-xs text-neutral-500">
                {formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}
              </span>
            </div>
            
            {/* Google Maps URL Input */}
            <div className="space-y-2">
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={mapsUrl}
                  onChange={(e) => handleMapsUrlChange(e.target.value)}
                  placeholder="Paste Google Maps URL here..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <p className="text-xs text-neutral-500">
                1. Search the restaurant on <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Google Maps</a>
                {' '}2. Copy the URL from your browser 3. Paste it above
              </p>
            </div>

            {/* Manual Coordinate Input - Only show when no URL */}
            {!mapsUrl && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}
            
            {/* Google MAP Preview */}
            <div className="h-64 rounded-xl overflow-hidden border border-neutral-200">
              <iframe
                title="Location preview"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={mapsUrl && extractPlaceFromUrl(mapsUrl)
                  ? `https://maps.google.com/maps?q=${encodeURIComponent(extractPlaceFromUrl(mapsUrl)!)}&z=15&output=embed`
                  : `https://maps.google.com/maps?q=${formData.latitude || 22.1937},${formData.longitude || 113.5399}&z=15&output=embed`
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-700">{t('admin.modal.labels.imageUrl')}</h3>
            
            {imagePreviews.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover rounded-xl border border-neutral-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={14} />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg backdrop-blur-sm">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="
                    h-32 border-2 border-dashed border-neutral-300
                    rounded-xl flex flex-col items-center justify-center
                    cursor-pointer hover:border-primary-400 hover:bg-primary-50
                    transition-all
                  "
                >
                  <Upload size={20} className="text-neutral-400 mb-2" />
                  <span className="text-sm text-neutral-500">Add More</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="
                  border-2 border-dashed border-neutral-300
                  rounded-xl p-8
                  text-center cursor-pointer
                  hover:border-primary-400 hover:bg-primary-50
                  transition-all
                "
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-neutral-100 rounded-full">
                    <ImageIcon className="w-6 h-6 text-neutral-400" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-700">
                      Click to upload images
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-primary-600">
                    <Upload size={18} />
                    <span className="font-medium">Select Files</span>
                  </div>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Menu Images Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-700">{t('restaurant.menu')}</h3>
            
            {menuPreviews.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {menuPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Menu ${index}`}
                      className="w-full h-32 object-cover rounded-xl border border-neutral-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeMenu(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div 
                  onClick={() => menuInputRef.current?.click()}
                  className="
                    h-32 border-2 border-dashed border-neutral-300
                    rounded-xl flex flex-col items-center justify-center
                    cursor-pointer hover:border-primary-400 hover:bg-primary-50
                    transition-all
                  "
                >
                  <Upload size={20} className="text-neutral-400 mb-2" />
                  <span className="text-sm text-neutral-500">Add More</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => menuInputRef.current?.click()}
                className="
                  border-2 border-dashed border-neutral-300
                  rounded-xl p-6
                  text-center cursor-pointer
                  hover:border-primary-400 hover:bg-primary-50
                  transition-all
                "
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className="text-neutral-400" />
                  <p className="text-sm text-neutral-600">Upload menu images</p>
                </div>
              </div>
            )}
            
            <input
              ref={menuInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleMenuChange}
              className="hidden"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-neutral-600 font-medium hover:bg-neutral-50 rounded-xl transition-colors"
            >
              {t('admin.modal.buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {restaurant ? t('admin.modal.buttons.save') : t('admin.modal.buttons.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
