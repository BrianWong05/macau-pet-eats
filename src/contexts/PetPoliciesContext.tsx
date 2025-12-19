import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { PetPolicyType } from '@/types/database'

interface PetPoliciesContextType {
  petPolicies: PetPolicyType[]
  isLoading: boolean
  getPetPolicyName: (policyKey: string, language: 'en' | 'zh' | 'pt') => string
  refreshPetPolicies: () => Promise<void>
}

const PetPoliciesContext = createContext<PetPoliciesContextType | undefined>(undefined)

export function PetPoliciesProvider({ children }: { children: ReactNode }) {
  const [petPolicies, setPetPolicies] = useState<PetPolicyType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPetPolicies = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('pet_policies')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      if (data) setPetPolicies(data)
    } catch (error) {
      console.error('Error fetching pet policies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPetPolicies()
  }, [])

  const getPetPolicyName = (policyKey: string, language: 'en' | 'zh' | 'pt') => {
    const policy = petPolicies.find(p => p.name === policyKey)
    if (!policy) return policyKey

    if (language === 'zh') return policy.name_zh || policy.name
    if (language === 'pt') return policy.name_pt || policy.name
    return policyKey === policy.name ? policyKey : policy.name // fallback logic if needed
  }

  return (
    <PetPoliciesContext.Provider 
      value={{ 
        petPolicies, 
        isLoading, 
        getPetPolicyName,
        refreshPetPolicies: fetchPetPolicies 
      }}
    >
      {children}
    </PetPoliciesContext.Provider>
  )
}

export function usePetPolicies() {
  const context = useContext(PetPoliciesContext)
  if (context === undefined) {
    throw new Error('usePetPolicies must be used within a PetPoliciesProvider')
  }
  return context
}
