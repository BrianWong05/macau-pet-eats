import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, AlertCircle, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { RestaurantSubmission, CuisineType, PetPolicy } from '@/types/database'

const PET_POLICY_OPTIONS: PetPolicy[] = [
  'indoors_allowed',
  'patio_only',
  'small_pets_only',
  'all_pets_welcome',
  'dogs_only',
  'cats_only'
]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface RestaurantFormProps {
  formData: RestaurantSubmission
  setFormData: React.Dispatch<React.SetStateAction<RestaurantSubmission>>
  cuisineTypes: CuisineType[]
  formState: FormState
  setFormState: (state: FormState) => void
  imageFiles: File[]
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>
  imagePreviews: string[]
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>
}

export function RestaurantForm({
  formData,
  setFormData,
  cuisineTypes,
  formState,
  setFormState,
  imageFiles,
  setImageFiles,
  imagePreviews,
  setImagePreviews
}: RestaurantFormProps) {
  const { t, i18n } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) return false
        if (file.size > 5 * 1024 * 1024) return false
        return true
      })

      if (validFiles.length > 0) {
        setImageFiles(prev => [...prev, ...validFiles])
        
        validFiles.forEach(file => {
          const reader = new FileReader()
          reader.onloadend = () => {
            setImagePreviews(prev => [...prev, reader.result as string])
          }
          reader.readAsDataURL(file)
        })
      }
    }
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const [highlightCuisine, setHighlightCuisine] = useState(false)
  const cuisineSectionRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('submitting')

    try {
      if (!formData.cuisine_type || formData.cuisine_type.length === 0) {
        setFormState('error')
        if (cuisineSectionRef.current) {
          cuisineSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setHighlightCuisine(true)
          setTimeout(() => setHighlightCuisine(false), 2000)
        }
        return
      }

      const uploadedUrls: string[] = []
      
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
          const filePath = `${fileName}`

          const { error: uploadError } = await (supabase.storage as any)
            .from('restaurants')
            .upload(filePath, file)

          if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

          const { data: { publicUrl } } = (supabase.storage as any)
            .from('restaurants')
            .getPublicUrl(filePath)
            
          uploadedUrls.push(publicUrl)
        }
      }

      const mainImageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : ''

      // Prepare data with Chinese fields for name, description, address
      // Map formData.name -> name_zh, formData.description -> description_zh, formData.address -> address_zh
      const dataToSave = { 
        ...formData,
        name_zh: formData.name,  // User inputs Chinese name
        description_zh: formData.description,  // User inputs Chinese description
        address_zh: formData.address,  // User inputs Chinese address
        name: '',  // Leave English name empty for admin to fill later
        description: '',  // Leave English description empty
        address: '',  // Leave English address empty
        image_url: mainImageUrl,
        gallery_images: uploadedUrls,
        status: 'pending' // Default status for new submissions
      }
      
      if (dataToSave.cuisine_type && Array.isArray(dataToSave.cuisine_type)) {
        const getLocalizedCuisines = (lang: string) => {
          return dataToSave.cuisine_type!.map(key => {
            if (key === 'Other') {
               return (formData as any).cuisine_type_other || 'Other'
            }
            return i18n.getFixedT(lang)(`cuisineTypes.${key.toLowerCase()}`)
          })
        }
        
        dataToSave.cuisine_type_zh = getLocalizedCuisines('zh')
        dataToSave.cuisine_type_pt = getLocalizedCuisines('pt')

        // Handle "Other" custom value
        if (dataToSave.cuisine_type.includes('Other') && (formData as any).cuisine_type_other) {
           const customVal = (formData as any).cuisine_type_other
           dataToSave.cuisine_type = dataToSave.cuisine_type.map(c => c === 'Other' ? customVal : c)
           // Replace in translations too
           dataToSave.cuisine_type_zh = dataToSave.cuisine_type_zh!.map(c => c === '其他' || c === 'Other' ? customVal : c)
           dataToSave.cuisine_type_pt = dataToSave.cuisine_type_pt!.map(c => c === 'Outros' || c === 'Other' ? customVal : c)
        }
      }

      // Remove temporary UI fields
      delete (dataToSave as any).cuisine_type_other

      // Add default location (Macau Tower) if not present
      if (!dataToSave.latitude) dataToSave.latitude = 22.1897
      if (!dataToSave.longitude) dataToSave.longitude = 113.5378

      const { error } = await supabase
        .from('restaurants')
        .insert(dataToSave as never)

      if (error) throw error

      setFormState('success')
    } catch (err) {
      console.error('Submission error:', err)
      setFormState('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {formState === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{t('submit.errorMessage')}</span>
        </div>
      )}

      {/* Restaurant Name */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
          {t('submit.form.name')} *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          placeholder={t('submit.form.namePlaceholder')}
          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all"
        />
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
          {t('submit.form.description')} ({t('submit.form.optional')})
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          placeholder={t('submit.form.descriptionPlaceholder')}
          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all resize-none"
        />
      </div>

      {/* Address */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-2">
          {t('submit.form.address')} *
        </label>
        <input
          type="text"
          id="address"
          name="address"
          required
          value={formData.address}
          onChange={handleInputChange}
          placeholder={t('submit.form.addressPlaceholder')}
          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all"
        />
      </div>

      {/* Location Area */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-2">
          {t('explore.filters.location') || '地區'} *
        </label>
        <select
          id="location"
          name="location"
          required
          value={(formData as any).location || '澳門'}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all appearance-none bg-white"
        >
          <option value="澳門">澳門 / Macau</option>
          <option value="氹仔">氹仔 / Taipa</option>
          <option value="路環">路環 / Coloane</option>
        </select>
      </div>

      {/* Pet Policy & Cuisine Type */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pet Policy */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <label htmlFor="pet_policy" className="block text-sm font-medium text-neutral-700 mb-2">
            {t('submit.form.petPolicy')} *
          </label>
          <select
            id="pet_policy"
            name="pet_policy"
            required
            value={formData.pet_policy}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all appearance-none bg-white"
          >
            {PET_POLICY_OPTIONS.map((policy) => (
              <option key={policy} value={policy}>
                {t(`petPolicy.${policy}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Cuisine Type */}
        <div 
          ref={cuisineSectionRef}
          className={`bg-white rounded-2xl shadow-card p-6 transition-colors duration-500 ${
            highlightCuisine ? 'ring-2 ring-red-500 bg-red-50' : ''
          }`}
        >
          <label htmlFor="cuisine_type" className="block text-sm font-medium text-neutral-700 mb-2">
            {t('submit.form.cuisineType')} *
          </label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {cuisineTypes.filter(ct => ct.name !== 'Other').map((ct: CuisineType) => {
                const name = i18n.language === 'zh' ? (ct.name_zh || ct.name) : 
                             i18n.language === 'pt' ? (ct.name_pt || ct.name) : ct.name
                const isSelected = (formData.cuisine_type || []).includes(ct.name)
                
                return (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => {
                      const current = formData.cuisine_type || []
                      const newTypes = current.includes(ct.name)
                        ? current.filter(c => c !== ct.name)
                        : [...current, ct.name]
                      setFormData(prev => ({ ...prev, cuisine_type: newTypes }))
                    }}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all border
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
              
              {/* Other option */}
              <button
                type="button"
                onClick={() => {
                  const current = formData.cuisine_type || []
                  const newTypes = current.includes('Other')
                    ? current.filter(c => c !== 'Other')
                    : [...current, 'Other']
                  setFormData(prev => ({ ...prev, cuisine_type: newTypes }))
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                  ${(formData.cuisine_type || []).includes('Other')
                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                  }
                `}
              >
                {t('common.other') || 'Other'}
              </button>
            </div>

            {(formData.cuisine_type || []).includes('Other') && (
              <input
                type="text"
                name="cuisine_type_other"
                value={(formData as any).cuisine_type_other || ''}
                onChange={handleInputChange}
                placeholder={t('submit.form.otherCuisinePlaceholder') || 'Please specify cuisine type'}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all"
              />
            )}
            
            {/* Hidden input for validation if needed, or rely on state check on submit */}
            {(formData.cuisine_type || []).length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                {t('submit.form.selectAtLeastOne') || 'Please select at least one cuisine type'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <label htmlFor="contact_info" className="block text-sm font-medium text-neutral-700 mb-2">
          {t('submit.form.contactInfo')} ({t('submit.form.optional')})
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-neutral-500 font-medium">+853</span>
          </div>
          <input
            type="text"
            id="contact_info"
            name="contact_info"
            value={formData.contact_info?.replace(/^\+853\s?/, '') || ''}
            onChange={(e) => {
              // Allow spaces/numbers but strip strictly +853 if pasted
              const val = e.target.value.replace(/^\+853\s?/, '')
              setFormData(prev => ({ ...prev, contact_info: `+853 ${val}` }))
            }}
            placeholder="6666 6666"
            className="w-full pl-16 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Social Media (Optional) */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {t('restaurant.socialMedia.title')} ({t('submit.form.optional') || 'Optional'})
        </label>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="url"
            value={formData.social_media?.facebook || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              social_media: { ...prev.social_media, facebook: e.target.value || '' }
            }))}
            placeholder="Facebook URL"
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all"
          />
          <input
            type="url"
            value={formData.social_media?.instagram || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              social_media: { ...prev.social_media, instagram: e.target.value || '' }
            }))}
            placeholder="Instagram URL"
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all"
          />
          <input
            type="url"
            value={formData.social_media?.website || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              social_media: { ...prev.social_media, website: e.target.value || '' }
            }))}
            placeholder="Website URL"
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Photo Upload */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {t('submit.form.uploadPhoto')} (Max 5 photos)
        </label>
        
        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                aria-label={t('common.close')}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {imagePreviews.length < 5 && (
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
                {imagePreviews.length === 0 ? t('submit.form.clickToUpload') : t('common.addMore')}
              </span>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={formState === 'submitting'}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {formState === 'submitting' ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{t('common.loading')}</span>
          </>
        ) : (
          <>
            <Send size={20} />
            <span>{t('submit.submitButton')}</span>
          </>
        )}
      </button>
    </form>
  )
}
