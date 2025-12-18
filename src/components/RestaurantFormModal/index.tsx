import { useState, useEffect, useRef } from 'react'
import { X, Loader, Upload, Image as ImageIcon, MapPin, Link as LinkIcon, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import type { Restaurant, DayOfWeek, OpeningHours, DayHours, CuisineType } from '@/types/database'

const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']



interface RestaurantFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  restaurant?: Restaurant | null
}

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
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapsUrl, setMapsUrl] = useState('')
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([])
  
  // Unified Image State
  type ImageItem = {
    id: string
    preview: string
    file?: File // If new upload
    url?: string // If existing
  }
  const [imageItems, setImageItems] = useState<ImageItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Menu Image State (Keep simple for now unless requested)
  const [menuFiles, setMenuFiles] = useState<File[]>([])
  const [menuPreviews, setMenuPreviews] = useState<string[]>([])
  const menuInputRef = useRef<HTMLInputElement>(null)

  // Fetch cuisine types from database
  useEffect(() => {
    const fetchCuisineTypes = async () => {
      const { data } = await supabase
        .from('cuisine_types')
        .select('*')
        .order('sort_order', { ascending: true })
      if (data) setCuisineTypes(data)
    }
    fetchCuisineTypes()
  }, [])

  const handleMapsUrlChange = (url: string) => {
    setMapsUrl(url)
    const coords = extractCoordsFromUrl(url)
    if (coords) {
      setFormData(prev => ({ 
        ...prev, 
        latitude: coords.lat, 
        longitude: coords.lng,
        google_maps_url: url
      }))
      toast.success('Location extracted from URL!')
    } else if (url) {
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
    cuisine_type: [],
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
      setMapsUrl(restaurant.google_maps_url || '')
      
      // Initialize Image Items
      // Prioritize gallery_images. If empty but image_url exists, use that.
      // Ideally gallery_images contains ALL images including cover.
      let initImages: ImageItem[] = []
      
      if (restaurant.gallery_images && restaurant.gallery_images.length > 0) {
        initImages = restaurant.gallery_images.map((url, index) => ({
           id: `existing-${index}-${Date.now()}`,
           preview: url,
           url: url
        }))
      } else if (restaurant.image_url) {
        // Legacy fallback
        initImages = [{
           id: `legacy-${Date.now()}`,
           preview: restaurant.image_url,
           url: restaurant.image_url
        }]
      }
      setImageItems(initImages)

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
        cuisine_type: [],
        contact_info: '',
        image_url: '',
        gallery_images: [],
        menu_images: [],
        latitude: 22.1937,
        longitude: 113.5399,
        status: 'approved'
      })
      setImageItems([])
      setMenuPreviews([])
    }
    setMenuFiles([])
  }, [restaurant, isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast.error(`Image ${file.name} is too large (max 5MB)`)
          return false
        }
        return true
      })

      if (validFiles.length > 0) {
        validFiles.forEach(file => {
          const reader = new FileReader()
          reader.onloadend = () => {
            setImageItems(prev => [...prev, {
              id: `new-${Math.random().toString(36).substr(2, 9)}`,
              preview: reader.result as string,
              file: file
            }])
          }
          reader.readAsDataURL(file)
        })
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (id: string) => {
    setImageItems(prev => prev.filter(item => item.id !== id))
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return
    if (direction === 'right' && index === imageItems.length - 1) return
    
    const newItems = [...imageItems]
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    
    // Swap
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp
    
    setImageItems(newItems)
  }
  
  const setCover = (index: number) => {
    if (index === 0) return
    const newItems = [...imageItems]
    const item = newItems.splice(index, 1)[0]
    newItems.unshift(item)
    setImageItems(newItems)
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
      if (!formData.cuisine_type || formData.cuisine_type.length === 0) {
        toast.error(t('submit.form.selectAtLeastOne') || 'Please select at least one cuisine type')
        setLoading(false)
        return
      }

      // Process Images sequentially to preserve order
      const finalGalleryImages: string[] = []
      
      for (const item of imageItems) {
        if (item.url) {
          finalGalleryImages.push(item.url)
        } else if (item.file) {
          // Upload new file
          const fileExt = item.file.name.split('.').pop()
          const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
          const filePath = `${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('restaurants')
            .upload(filePath, item.file)

          if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

          const { data: { publicUrl } } = supabase.storage
            .from('restaurants')
            .getPublicUrl(filePath)
            
          finalGalleryImages.push(publicUrl)
        }
      }

      // Ensure image_url (main image) is set too. Use first gallery image if available.
      let mainImageUrl = finalGalleryImages.length > 0 ? finalGalleryImages[0] : ''

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

      const dataToSave: any = {
        ...formData,
        gallery_images: finalGalleryImages,
        menu_images: finalMenuImages,
        image_url: mainImageUrl
      }

      // Remove temporary UI fields that shouldn't go to DB
      delete dataToSave.cuisine_type_other

      // Auto-populate cuisine_type_zh and cuisine_type_pt logic
      if (formData.cuisine_type && Array.isArray(formData.cuisine_type)) {
        const getLocalizedCuisines = (lang: string) => {
          return formData.cuisine_type!.map(key => {
            if (key === 'Other') {
              return (formData as any).cuisine_type_other || 'Other'
            }
            return i18n.getFixedT(lang)(`cuisineTypes.${key.toLowerCase()}`)
          })
        }
        dataToSave.cuisine_type_zh = getLocalizedCuisines('zh')
        dataToSave.cuisine_type_pt = getLocalizedCuisines('pt')
        
        if (dataToSave.cuisine_type?.includes('Other') && (formData as any).cuisine_type_other) {
           const customVal = (formData as any).cuisine_type_other
           dataToSave.cuisine_type = dataToSave.cuisine_type!.map((c: string) => c === 'Other' ? customVal : c)
           const custom = (formData as any).cuisine_type_other
           if (custom) {
             dataToSave.cuisine_type_zh = dataToSave.cuisine_type_zh.map((c: string) => c === '其他' || c === 'Other' ? custom : c)
             dataToSave.cuisine_type_pt = dataToSave.cuisine_type_pt.map((c: string) => c === 'Outros' || c === 'Other' ? custom : c)
           }
        }
      }

      if (restaurant?.id) {
        // Update
        const { error } = await supabase
          .from('restaurants')
          .update(dataToSave)
          .eq('id', restaurant.id)
        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('restaurants')
          .insert(dataToSave)
        if (error) throw error
      }
      onSave()
      onClose()
      toast.success(restaurant ? 'Restaurant updated successfully' : 'Restaurant created successfully')
    } catch (err) {
      console.error('Submission error:', err)
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
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                  {cuisineTypes.filter(ct => ct.name !== 'Other').map((ct: CuisineType) => {
                    const name = i18n.language === 'zh' ? (ct.name_zh || ct.name) : 
                                 i18n.language === 'pt' ? (ct.name_pt || ct.name) : ct.name
                    // Ensure cuisine_type is treated as array
                    const currentTypes = (formData.cuisine_type as string[]) || []
                    const isSelected = currentTypes.includes(ct.name)
                    
                    return (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => {
                          const current = (formData.cuisine_type as string[]) || []
                          const newTypes = current.includes(ct.name)
                            ? current.filter(c => c !== ct.name)
                            : [...current, ct.name]
                          setFormData(prev => ({ ...prev, cuisine_type: newTypes }))
                        }}
                        className={`
                          px-2 py-1.5 rounded-lg text-xs font-medium transition-all border text-center truncate
                          ${isSelected
                            ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                          }
                        `}
                      >
                        {name}
                      </button>
                    )
                  })}
                  
                  <button
                    type="button"
                    onClick={() => {
                      const current = (formData.cuisine_type as string[]) || []
                      const newTypes = current.includes('Other')
                        ? current.filter(c => c !== 'Other')
                        : [...current, 'Other']
                      setFormData(prev => ({ ...prev, cuisine_type: newTypes }))
                    }}
                    className={`
                      px-2 py-1.5 rounded-lg text-xs font-medium transition-all border text-center truncate
                      ${((formData.cuisine_type as string[]) || []).includes('Other')
                        ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                      }
                    `}
                  >
                    {t('common.other') || 'Other'}
                  </button>
                </div>
                {((formData.cuisine_type as string[]) || []).includes('Other') && (
                  <input
                    type="text"
                    required
                    value={(formData as any).cuisine_type_other || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cuisine_type_other: e.target.value }))}
                    placeholder={t('submit.form.otherCuisinePlaceholder') || 'Please specify'}
                    className="w-full mt-2 px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                )}
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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-neutral-500 font-medium">+853</span>
              </div>
              <input
                type="text"
                value={formData.contact_info?.replace(/^\+853\s?/, '') || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/^\+853\s?/, '')
                  setFormData(prev => ({ ...prev, contact_info: `+853 ${val}` }))
                }}
                className="w-full pl-16 pr-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="6666 6666"
              />
            </div>
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
            
            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 gap-4">
              {imageItems.map((item, index) => (
                <div key={item.id} className="relative aspect-square group">
                   <img
                    src={item.preview}
                    alt={`Preview ${index + 1}`}
                    className={`w-full h-full object-cover rounded-xl transition-all ${index === 0 ? 'ring-4 ring-primary-500' : ''}`}
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded-md shadow-sm">
                      Cover
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    {/* Reorder Buttons */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, 'left')}
                        className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-neutral-900 rounded-full backdrop-blur-sm transition-all"
                        title="Move Left"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      </button>
                    )}
                    
                    {index < imageItems.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, 'right')}
                        className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-neutral-900 rounded-full backdrop-blur-sm transition-all"
                        title="Move Right"
                      >
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    )}

                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => setCover(index)}
                        className="p-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-all"
                        title="Make Cover"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add More Button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="
                  border-2 border-dashed border-neutral-300
                  rounded-xl aspect-square
                  flex flex-col items-center justify-center
                  cursor-pointer
                  hover:border-primary-400 hover:bg-primary-50
                  transition-all
                "
              >
                <div className="p-2 bg-neutral-100 rounded-full mb-2">
                  <Upload size={20} className="text-neutral-400" />
                </div>
                <span className="text-xs font-medium text-neutral-600 text-center px-2">
                  {imageItems.length === 0 ? 'Upload Photos' : 'Add More'}
                </span>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            
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
