import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PawPrint, Heart, Plus, LogIn, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'
import { getUserPets, deletePet, createPet, updatePet, PET_TYPES, PET_SIZES } from '@/services/userPets'
import { PetProfileCard } from '@/components/PetProfileCard'
import { RestaurantCard } from '@/components/RestaurantCard'
import { AuthModal } from '@/components/AuthModal'
import { ProfileHeader } from '@/components/Profile/ProfileHeader'
import type { UserPet, PetSize } from '@/types/database'

type TabType = 'pets' | 'favorites'

// Inline UsernameEditor component
function UsernameEditor() {
  const { t } = useTranslation()
  const { username, updateUsername } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState(username || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!newUsername.trim()) {
      toast.error(t('profile.usernameRequired'))
      return
    }
    
    setIsSaving(true)
    const { error } = await updateUsername(newUsername.trim())
    setIsSaving(false)
    
    if (error) {
      toast.error(t('common.error'))
    } else {
      toast.success(t('profile.usernameUpdated'))
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className="text-xl font-bold text-neutral-900 border-b-2 border-primary-500 bg-transparent outline-none px-1"
          placeholder={t('profile.usernamePlaceholder')}
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 text-green-600 hover:bg-green-50 rounded-full transition-colors"
        >
          <Check size={18} />
        </button>
        <button
          onClick={() => {
            setIsEditing(false)
            setNewUsername(username || '')
          }}
          className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <h2 className="text-xl font-bold text-neutral-900">
        {username || t('profile.setUsername')}
      </h2>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
        title={t('profile.editUsername')}
      >
        <Pencil size={16} />
      </button>
    </div>
  )
}

export function Profile() {
  const { t } = useTranslation()
  const { user, username } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('pets')
  const { favorites, isLoading: favoritesLoading } = useFavorites()
  
  // Pets state
  const [pets, setPets] = useState<UserPet[]>([])
  const [petsLoading, setPetsLoading] = useState(true)
  const [showPetModal, setShowPetModal] = useState(false)
  const [editingPet, setEditingPet] = useState<UserPet | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Fetch pets
  useEffect(() => {
    const fetchPets = async () => {
      if (!user) {
        setPets([])
        setPetsLoading(false)
        return
      }
      
      setPetsLoading(true)
      const data = await getUserPets()
      setPets(data)
      setPetsLoading(false)
    }
    
    fetchPets()
  }, [user])

  // Handle pet deletion
  const handleDeletePet = async (petId: string) => {
    if (!confirm(t('pets.deleteConfirm'))) return
    
    try {
      await deletePet(petId)
      setPets(prev => prev.filter(p => p.id !== petId))
      toast.success(t('pets.deleted'))
    } catch {
      toast.error(t('common.error'))
    }
  }

  // Handle edit pet
  const handleEditPet = (pet: UserPet) => {
    setEditingPet(pet)
    setShowPetModal(true)
  }

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <LogIn size={40} className="text-primary-500" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('profile.loginRequired')}</h1>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            {t('auth.loginButton')}
          </button>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <ProfileHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Info */}
        <div className="mb-8 bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {(username || user.email?.charAt(0) || '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <UsernameEditor />
              <p className="text-neutral-500 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pets')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'pets'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <PawPrint size={18} />
            {t('profile.tabs.pets')}
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Heart size={18} />
            {t('profile.tabs.favorites')}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'pets' && (
          <div className="space-y-6">
            {/* Add Pet Button */}
            <button
              onClick={() => {
                setEditingPet(null)
                setShowPetModal(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              <Plus size={18} />
              {t('pets.addPet')}
            </button>

            {/* Pets Grid */}
            {petsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-neutral-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : pets.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                <PawPrint size={48} className="mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-600 font-medium">{t('pets.noPets')}</p>
                <p className="text-neutral-400 text-sm mt-1">{t('pets.noPetsHint')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pets.map(pet => (
                  <PetProfileCard
                    key={pet.id}
                    pet={pet}
                    onEdit={handleEditPet}
                    onDelete={handleDeletePet}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-6">
            {favoritesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-neutral-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                <Heart size={48} className="mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-600 font-medium">{t('favorites.noFavorites')}</p>
                <p className="text-neutral-400 text-sm mt-1">{t('favorites.noFavoritesHint')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(fav => fav.restaurant && (
                  <RestaurantCard
                    key={fav.restaurant_id}
                    restaurant={fav.restaurant}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pet Modal */}
        {showPetModal && (
          <PetFormModal
            pet={editingPet}
            onClose={() => {
              setShowPetModal(false)
              setEditingPet(null)
            }}
            onSave={async (data) => {
              try {
                if (editingPet) {
                  const updated = await updatePet(editingPet.id, data)
                  setPets(prev => prev.map(p => p.id === editingPet.id ? updated : p))
                  toast.success(t('pets.updated'))
                } else {
                  const newPet = await createPet(data as { name: string; type: string; size: PetSize; breed?: string | null })
                  setPets(prev => [newPet, ...prev])
                  toast.success(t('pets.added'))
                }
                setShowPetModal(false)
                setEditingPet(null)
              } catch {
                toast.error(t('common.error'))
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

// Pet Form Modal Component
interface PetFormModalProps {
  pet: UserPet | null
  onClose: () => void
  onSave: (data: { name: string; type: string; size: PetSize; breed?: string | null }) => Promise<void>
}

function PetFormModal({ pet, onClose, onSave }: PetFormModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(pet?.name || '')
  const [type, setType] = useState(pet?.type || 'dog')
  const [size, setSize] = useState<PetSize>(pet?.size || 'medium')
  const [breed, setBreed] = useState(pet?.breed || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error(t('pets.namePlaceholder'))
      return
    }
    
    setSaving(true)
    await onSave({ name, type, size, breed: breed || null })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">
          {pet ? t('pets.editPet') : t('pets.addPet')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">{t('pets.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('pets.namePlaceholder')}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">{t('pets.type')}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              {PET_TYPES.map(t_type => (
                <option key={t_type} value={t_type}>{t(`pets.types.${t_type}`)}</option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">{t('pets.size')}</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as PetSize)}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              {PET_SIZES.map(s => (
                <option key={s.value} value={s.value}>{t(`pets.sizes.${s.value}`)}</option>
              ))}
            </select>
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">{t('pets.breed')}</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder={t('pets.breedPlaceholder')}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
