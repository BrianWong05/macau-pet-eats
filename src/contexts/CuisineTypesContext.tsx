import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface CuisineType {
  id: string
  name: string
  name_zh: string
  name_pt: string
  sort_order: number
}

interface CuisineTypesContextType {
  cuisineTypes: CuisineType[]
  loading: boolean
  getLocalizedName: (code: string, lang: 'zh' | 'en' | 'pt') => string
}

const CuisineTypesContext = createContext<CuisineTypesContextType | undefined>(undefined)

export function CuisineTypesProvider({ children }: { children: ReactNode }) {
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCuisineTypes = async () => {
      const { data, error } = await supabase
        .from('cuisine_types')
        .select('*')
        .order('sort_order')
      
      if (!error && data) {
        setCuisineTypes(data)
      }
      setLoading(false)
    }

    fetchCuisineTypes()
  }, [])

  const getLocalizedName = (code: string, lang: 'zh' | 'en' | 'pt'): string => {
    // Case-insensitive lookup to handle both "portuguese" and "Portuguese"
    const cuisineType = cuisineTypes.find(ct => ct.name.toLowerCase() === code.toLowerCase())
    if (!cuisineType) return code // Fallback to raw code if not found
    
    switch (lang) {
      case 'zh':
        return cuisineType.name_zh || cuisineType.name
      case 'pt':
        return cuisineType.name_pt || cuisineType.name
      default:
        return cuisineType.name
    }
  }

  return (
    <CuisineTypesContext.Provider value={{ cuisineTypes, loading, getLocalizedName }}>
      {children}
    </CuisineTypesContext.Provider>
  )
}

export function useCuisineTypes() {
  const context = useContext(CuisineTypesContext)
  if (context === undefined) {
    throw new Error('useCuisineTypes must be used within a CuisineTypesProvider')
  }
  return context
}
