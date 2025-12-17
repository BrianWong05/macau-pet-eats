import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ArrowLeft, 
  Send, 
  CheckCircle,
  AlertCircle,
  PawPrint,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'
import type { PetPolicy, RestaurantSubmission } from '@/types/database'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

// Pet policy options
const PET_POLICY_OPTIONS: PetPolicy[] = [
  'indoors_allowed',
  'patio_only',
  'small_pets_only',
  'all_pets_welcome',
  'dogs_only',
  'cats_only'
]

// Cuisine type options
const CUISINE_TYPE_OPTIONS = [
  { value: 'portuguese', labelKey: 'cuisineTypes.portuguese' },
  { value: 'cantonese', labelKey: 'cuisineTypes.cantonese' },
  { value: 'fusion', labelKey: 'cuisineTypes.fusion' },
  { value: 'international', labelKey: 'cuisineTypes.international' },
  { value: 'seafood', labelKey: 'cuisineTypes.seafood' },
  { value: 'brunch', labelKey: 'cuisineTypes.brunch' },
  { value: 'japanese', labelKey: 'cuisineTypes.japanese' },
  { value: 'italian', labelKey: 'cuisineTypes.italian' },
  { value: 'thai', labelKey: 'cuisineTypes.thai' },
  { value: 'other', labelKey: 'cuisineTypes.other' }
]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function Submit() {
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const [formState, setFormState] = useState<FormState>('idle')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<RestaurantSubmission>({
    name: '',
    description: '',
    address: '',
    pet_policy: 'patio_only',
    cuisine_type: '',
    contact_info: '',
    image_url: ''
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return
      }
      
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

    // Simulate API call - in production, this would:
    // 1. Upload image to Supabase Storage
    // 2. Get the public URL
    // 3. Insert restaurant with image_url
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For now, just log the submission
      console.log('Restaurant submission:', formData)
      console.log('Image file:', imageFile)
      
      setFormState('success')
    } catch {
      setFormState('error')
    }
  }

  const resetForm = () => {
    setFormState('idle')
    setImageFile(null)
    setImagePreview(null)
    setFormData({
      name: '',
      description: '',
      address: '',
      pet_policy: 'patio_only',
      cuisine_type: '',
      contact_info: '',
      image_url: ''
    })
  }

  // Success state
  if (formState === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-secondary-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">
            {t('submit.successTitle')}
          </h1>
          <p className="text-neutral-600 mb-8">
            {t('submit.successMessage')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              {t('submit.backToHome')}
            </Link>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-white border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
            >
              {t('nav.submit')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b
          ${isScrolled ? 'bg-white/90 backdrop-blur-md border-neutral-200 py-3 shadow-sm' : 'bg-white border-neutral-200 py-4'}
        `}
      >
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
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
                {t('submit.title')}
              </h1>
              <p className="text-sm text-neutral-500 hidden sm:block">
                {t('submit.subtitle')}
              </p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-8 pt-28">
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
              {t('submit.form.description')} *
            </label>
            <textarea
              id="description"
              name="description"
              required
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
              <select
                id="cuisine_type"
                name="cuisine_type"
                required
                value={formData.cuisine_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all appearance-none bg-white"
              >
                <option value="">{t('submit.form.selectCuisine')}</option>
                {CUISINE_TYPE_OPTIONS.map((cuisine) => (
                  <option key={cuisine.value} value={cuisine.value}>
                    {t(cuisine.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <label htmlFor="contact_info" className="block text-sm font-medium text-neutral-700 mb-2">
              {t('submit.form.contactInfo')} *
            </label>
            <input
              type="text"
              id="contact_info"
              name="contact_info"
              required
              value={formData.contact_info}
              onChange={handleInputChange}
              placeholder={t('submit.form.contactInfoPlaceholder')}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all"
            />
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
      </div>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8 mt-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <PawPrint className="w-5 h-5 text-primary-400" />
            <span className="font-semibold text-white">{t('common.appName')}</span>
          </div>
          <p className="text-sm">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
