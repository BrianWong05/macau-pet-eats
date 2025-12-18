import { useState, useEffect } from 'react'

import { supabase } from '@/lib/supabase'
import type { RestaurantSubmission, CuisineType } from '@/types/database'
import { SubmitHeader } from '@/components/Submit/SubmitHeader'
import { SuccessView } from '@/components/Submit/SuccessView'
import { RestaurantForm } from '@/components/Submit/RestaurantForm'
import { SubmitFooter } from '@/components/Submit/SubmitFooter'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function Submit() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([])
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
  
  const [formState, setFormState] = useState<FormState>('idle')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<RestaurantSubmission>({
    name: '',
    description: '',
    address: '',
    pet_policy: 'patio_only',
    cuisine_type: '',
    contact_info: '',
    image_url: '',
    social_media: {
      facebook: '',
      instagram: '',
      website: ''
    }
  })

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
      image_url: '',
      social_media: {
        facebook: '',
        instagram: '',
        website: ''
      }
    })
  }

  // Success state
  if (formState === 'success') {
    return <SuccessView onReset={resetForm} />
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <SubmitHeader isScrolled={isScrolled} />

      <div className="max-w-3xl mx-auto px-4 py-8 pt-28">
        <RestaurantForm 
          formData={formData}
          setFormData={setFormData}
          cuisineTypes={cuisineTypes}
          formState={formState}
          setFormState={setFormState}
          imageFile={imageFile}
          setImageFile={setImageFile}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
        />
      </div>

      <SubmitFooter />
    </div>
  )
}
