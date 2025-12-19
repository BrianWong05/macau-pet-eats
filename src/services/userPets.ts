import { supabase } from '@/lib/supabase'
import type { UserPet, PetSize } from '@/types/database'

// Get all pets for the current user
export async function getUserPets(): Promise<UserPet[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_pets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user pets:', error)
    return []
  }

  return data || []
}

// Get a single pet by ID
export async function getPetById(petId: string): Promise<UserPet | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_pets')
    .select('*')
    .eq('id', petId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching pet:', error)
    return null
  }

  return data
}

// Create a new pet profile
export interface CreatePetInput {
  name: string
  type: string
  size: PetSize
  breed?: string | null
  image_url?: string | null
}

export async function createPet(input: CreatePetInput): Promise<UserPet> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('user_pets')
    .insert({
      user_id: user.id,
      name: input.name,
      type: input.type.toLowerCase(),
      size: input.size,
      breed: input.breed || null,
      image_url: input.image_url || null
    } as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating pet:', error)
    throw error
  }

  return data
}

// Update an existing pet profile
export interface UpdatePetInput {
  name?: string
  type?: string
  size?: PetSize
  breed?: string | null
  image_url?: string | null
}

export async function updatePet(petId: string, input: UpdatePetInput): Promise<UserPet> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const updateData: Record<string, unknown> = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.type !== undefined) updateData.type = input.type.toLowerCase()
  if (input.size !== undefined) updateData.size = input.size
  if (input.breed !== undefined) updateData.breed = input.breed
  if (input.image_url !== undefined) updateData.image_url = input.image_url

  const { data, error } = await supabase
    .from('user_pets')
    .update(updateData as never)
    .eq('id', petId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating pet:', error)
    throw error
  }

  return data
}

// Delete a pet profile
export async function deletePet(petId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('user_pets')
    .delete()
    .eq('id', petId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting pet:', error)
    throw error
  }

  return true
}

// Pet type options
export const PET_TYPES = ['dog', 'cat', 'bird', 'rabbit', 'other'] as const

// Pet size options with labels
export const PET_SIZES: { value: PetSize; label: string }[] = [
  { value: 'small', label: 'Small (< 10kg)' },
  { value: 'medium', label: 'Medium (10-25kg)' },
  { value: 'large', label: 'Large (> 25kg)' }
]
