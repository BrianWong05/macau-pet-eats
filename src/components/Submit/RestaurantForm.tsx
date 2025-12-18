import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, AlertCircle, Upload, X, Image as ImageIcon } from 'lucide-react'
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
  imageFile: File | null
  setImageFile: (file: File | null) => void
  imagePreview: string | null
  setImagePreview: (url: string | null) => void
}

export function RestaurantForm({
  formData,
  setFormData,
  cuisineTypes,
  formState,
  setFormState,
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview
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
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) return
      if (file.size > 5 * 1024 * 1024) return
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('submitting')

    try {
      // Prepare data with localized cuisine types
      const dataToSave = { ...formData }
      
      if (dataToSave.cuisine_type && Array.isArray(dataToSave.cuisine_type)) {
        const getLocalizedCuisines = (lang: string) => {
          return dataToSave.cuisine_type!.map(key => {
            // Use i18n to get fixed language translation
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

      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Restaurant submission:', dataToSave)
      console.log('Image file:', imageFile)
      setFormState('success')
    } catch {
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
        <div className="bg-white rounded-2xl shadow-card p-6">
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
          {t('submit.form.uploadPhoto')}
        </label>
        
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              aria-label={t('common.close')}
            >
              <X size={16} />
            </button>
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
                  {t('submit.form.clickToUpload')}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  {t('submit.form.uploadHint')}
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary-600">
                <Upload size={18} />
                <span className="font-medium">{t('submit.form.selectFile')}</span>
              </div>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
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
