import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ReviewFormModal } from '@/components/ReviewFormModal'
import { PawPrint, Heart, Plus, LogIn, Pencil, Check, X, Camera, Store, MessageCircle, AlertTriangle, Star, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'
import { supabase } from '@/lib/supabase'
import { getUserPets, deletePet, createPet, updatePet, PET_TYPES, PET_SIZES } from '@/services/userPets'
import { PetProfileCard } from '@/components/PetProfileCard'
import { RestaurantCard } from '@/components/RestaurantCard'
import { AuthModal } from '@/components/AuthModal'
import { ProfileHeader } from '@/components/Profile/ProfileHeader'
import type { UserPet, PetSize, Restaurant, AppFeedback, RestaurantReport } from '@/types/database'

type TabType = 'pets' | 'favorites' | 'contributions' | 'feedback' | 'reports' | 'reviews'

// Inline UsernameEditor component
function UsernameEditor() {
  const { t } = useTranslation(['profile', 'common'])
  const { username, updateUsername } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState(username || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!newUsername.trim()) {
      toast.error(t('profile:usernameRequired'))
      return
    }
    
    setIsSaving(true)
    const { error } = await updateUsername(newUsername.trim())
    setIsSaving(false)
    
    if (error) {
      toast.error(t('common:error'))
    } else {
      toast.success(t('profile:usernameUpdated'))
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
          placeholder={t('profile:usernamePlaceholder')}
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
        {username || t('profile:setUsername')}
      </h2>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
        title={t('profile:editUsername')}
      >
        <Pencil size={16} />
      </button>
    </div>
  )
}

// Avatar Upload component
function AvatarUpload() {
  const { t } = useTranslation(['profile', 'common'])
  const { user, username, avatarUrl, updateAvatar } = useAuth()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('common:uploadError'))
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('profile:avatarTooLarge'))
      return
    }

    setIsUploading(true)
    const { error } = await updateAvatar(file)
    setIsUploading(false)

    if (error) {
      toast.error(t('common:error'))
    } else {
      toast.success(t('profile:avatarUpdated'))
    }
  }

  const initial = (username || user?.email?.charAt(0) || '?').charAt(0).toUpperCase()

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="relative w-20 h-20 cursor-pointer group">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-neutral-200 group-hover:border-primary-400 transition-colors"
          />
        ) : (
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center border-2 border-transparent group-hover:border-primary-400 transition-colors">
            <span className="text-2xl font-bold text-primary-600">{initial}</span>
          </div>
        )}
        {isUploading ? (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-full flex items-center justify-center transition-colors">
            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </label>
      <label className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer font-medium flex items-center gap-1">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <Camera size={14} />
        {t('profile:changePhoto')}
      </label>
    </div>
  )
}

export function Profile() {
  const { t } = useTranslation(['profile', 'common', 'submit', 'feedback', 'auth'])
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('pets')
  const { favorites, isLoading: favoritesLoading } = useFavorites()
  
  // Pets state
  const [pets, setPets] = useState<UserPet[]>([])
  const [petsLoading, setPetsLoading] = useState(true)
  const [showPetModal, setShowPetModal] = useState(false)
  const [editingPet, setEditingPet] = useState<UserPet | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Contributions state
  const [contributions, setContributions] = useState<Restaurant[]>([])
  const [contributionsLoading, setContributionsLoading] = useState(true)

  // Feedback state
  const [feedbacks, setFeedbacks] = useState<AppFeedback[]>([])
  const [feedbacksLoading, setFeedbacksLoading] = useState(true)

  // Reports state
  const [reports, setReports] = useState<RestaurantReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)

  // Reviews state
  interface UserReview {
    id: string
    restaurant_id: string
    rating: number
    comment: string | null
    created_at: string
    image_url: string | null
    images: string[] | null
    restaurants: { name: string; name_zh: string | null } | null
    is_hidden?: boolean
    admin_comment?: string | null
  }
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [editingReview, setEditingReview] = useState<UserReview | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

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

  // Fetch user's contributions
  useEffect(() => {
    const fetchContributions = async () => {
      if (!user) {
        setContributions([])
        setContributionsLoading(false)
        return
      }
      
      setContributionsLoading(true)
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setContributions(data as Restaurant[])
      }
      setContributionsLoading(false)
    }
    
    fetchContributions()
  }, [user])

  // Fetch user's feedback submissions
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!user) {
        setFeedbacks([])
        setFeedbacksLoading(false)
        return
      }
      
      setFeedbacksLoading(true)
      const { data, error } = await supabase
        .from('app_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setFeedbacks(data as AppFeedback[])
      }
      setFeedbacksLoading(false)
    }
    
    fetchFeedbacks()
  }, [user])

  // Fetch user's restaurant reports
  useEffect(() => {
    const fetchReports = async () => {
      if (!user) {
        setReports([])
        setReportsLoading(false)
        return
      }
      
      setReportsLoading(true)
      const { data, error } = await supabase
        .from('restaurant_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setReports(data as RestaurantReport[])
      }
      setReportsLoading(false)
    }
    
    fetchReports()
  }, [user])

  // Fetch user's reviews
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user) {
        setReviews([])
        setReviewsLoading(false)
        return
      }
      
      setReviewsLoading(true)
      const { data, error } = await supabase
        .from('reviews')
        .select('id, restaurant_id, rating, comment, image_url, images, created_at, is_hidden, admin_comment, restaurants(name, name_zh)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setReviews(data as UserReview[])
      }
      setReviewsLoading(false)
    }
    
    fetchUserReviews()
  }, [user])

  const handleEditReview = (review: UserReview) => {
    setEditingReview(review)
    setShowReviewModal(true)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm(t('common:confirmDelete'))) return

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
      
      if (error) throw error
      
      setReviews(prev => prev.filter(r => r.id !== reviewId))
      toast.success(t('common:deleteSuccess'))
    } catch {
      toast.error(t('common:error'))
    }
  }

  const handleReviewUpdated = () => {
    // Refresh reviews
    const fetchUserReviews = async () => {
      if (!user) return
      setReviewsLoading(true)
      const { data, error } = await supabase
        .from('reviews')
        .select('id, restaurant_id, rating, comment, image_url, images, created_at, is_hidden, admin_comment, restaurants(name, name_zh)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setReviews(data as UserReview[])
      }
      setReviewsLoading(false)
    }
    fetchUserReviews()
  }

  // Handle pet deletion
  const handleDeletePet = async (petId: string) => {
    if (!confirm(t('profile:pets.deleteConfirm'))) return
    
    try {
      await deletePet(petId)
      setPets(prev => prev.filter(p => p.id !== petId))
      toast.success(t('profile:pets.deleted'))
    } catch {
      toast.error(t('common:error'))
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
          <h1 className="text-2xl font-bold text-neutral-900">{t('profile:loginRequired')}</h1>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            {t('auth:loginButton')}
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
      
      {/* Profile Hero with Gradient */}
      <div className="relative mb-6">
        {/* Gradient Background */}
        <div className="h-24 sm:h-32 bg-gradient-to-br from-primary-400 via-primary-500 to-amber-400" />
        
        {/* Profile Card */}
        <div className="mx-4 -mt-12 sm:-mt-16 bg-white rounded-2xl shadow-lg border border-neutral-100 p-4 sm:p-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-3 sm:gap-4">
            <AvatarUpload />
            <div className="flex-1 min-w-0">
              <UsernameEditor />
              <p className="text-neutral-500 text-sm truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Tabs */}
      <div className="px-4 mb-6">
        <div className="flex bg-neutral-100 rounded-2xl p-1 overflow-x-auto scrollbar-hide">
          {[
            { key: 'pets', icon: PawPrint, label: t('profile:tabs.pets') },
            { key: 'favorites', icon: Heart, label: t('profile:tabs.favorites') },
            { key: 'contributions', icon: Store, label: t('profile:tabs.contributions') },
            { key: 'feedback', icon: MessageCircle, label: t('profile:tabs.feedback') },
            { key: 'reports', icon: AlertTriangle, label: t('profile:tabs.reports') },
            { key: 'reviews', icon: Star, label: t('profile:tabs.reviews') },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`
                flex-1 min-w-fit flex flex-col items-center gap-1 px-3 py-2.5 sm:px-4 sm:py-3
                text-xs sm:text-sm font-medium rounded-xl transition-all
                ${activeTab === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
                }
              `}
            >
              <tab.icon size={18} />
              <span className="truncate w-full text-center leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4">

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
              {t('profile:pets.addPet')}
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
                <p className="text-neutral-600 font-medium">{t('profile:pets.noPets')}</p>
                <p className="text-neutral-400 text-sm mt-1">{t('profile:pets.noPetsHint')}</p>
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
                <p className="text-neutral-600 font-medium">{t('profile:favorites.noFavorites')}</p>
                <p className="text-neutral-400 text-sm mt-1">{t('profile:favorites.noFavoritesHint')}</p>
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

        {/* Contributions Content */}
        {activeTab === 'contributions' && (
          <div className="space-y-6">
            {contributionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-neutral-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : contributions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                <Store size={48} className="mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-600 font-medium">{t('submit:noContributions')}</p>
                <p className="text-neutral-400 text-sm mt-1">{t('submit:noContributionsHint')}</p>
                <Link
                  to="/submit"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                >
                  <Plus size={18} />
                  {t('submit:title')}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {contributions.map(restaurant => (
                  <div
                    key={restaurant.id}
                    className="bg-white rounded-xl border border-neutral-200 p-4"
                  >
                    <div className="flex items-center gap-4">
                      {restaurant.image_url && (
                        <img
                          src={restaurant.image_url}
                          alt={restaurant.name_zh || restaurant.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 truncate">
                          {restaurant.name_zh || restaurant.name || t('common:unnamed')}
                        </h3>
                        <p className="text-sm text-neutral-500 truncate">
                          {restaurant.address_zh || restaurant.address}
                        </p>
                      </div>
                      {/* Status Badge */}
                      <div className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        restaurant.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : restaurant.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {restaurant.status === 'approved' 
                          ? t('submit:status.approved')
                          : restaurant.status === 'rejected'
                          ? t('submit:status.rejected')
                          : t('submit:status.pending')}
                      </div>
                    </div>
                    {/* Admin Comment */}
                    {restaurant.admin_comment && (
                      <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <p className="text-xs font-medium text-neutral-500 mb-1">{t('common:adminComment')}</p>
                        <p className="text-sm text-neutral-700">{restaurant.admin_comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback Content */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            {feedbacksLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-neutral-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                <MessageCircle size={48} className="mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-600 font-medium">{t('feedback:noFeedback')}</p>
                <p className="text-neutral-400 text-sm mt-1">{t('feedback:noFeedbackHint')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map(fb => (
                  <div
                    key={fb.id}
                    className="bg-white rounded-xl border border-neutral-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            fb.type === 'bug' ? 'bg-red-100 text-red-700' :
                            fb.type === 'feature' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {t(`feedback:types.${fb.type}`)}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {new Date(fb.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-neutral-700 text-sm line-clamp-2">
                          {fb.message}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        fb.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : fb.status === 'reviewed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {t(`feedback:status.${fb.status}`)}
                      </div>
                    </div>
                    {/* Admin Comment */}
                    {fb.admin_comment && (
                      <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <p className="text-xs font-medium text-neutral-500 mb-1">{t('common:adminComment')}</p>
                        <p className="text-sm text-neutral-700">{fb.admin_comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports Content */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {reportsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-neutral-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                <AlertTriangle size={48} className="mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-600 font-medium">{t('feedback:report.noReports')}</p>
                <p className="text-neutral-400 text-sm mt-1">{t('feedback:report.noReportsHint')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(rpt => (
                  <div
                    key={rpt.id}
                    className="bg-white rounded-xl border border-neutral-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-neutral-700">
                            {rpt.field_name}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {new Date(rpt.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-neutral-600 text-sm truncate">
                          {rpt.suggested_value}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        rpt.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : rpt.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {t(`feedback:report.status.${rpt.status}`)}
                      </div>
                    </div>
                    {/* Admin Comment */}
                    {rpt.admin_comment && (
                      <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <p className="text-xs font-medium text-neutral-500 mb-1">{t('common:adminComment')}</p>
                        <p className="text-sm text-neutral-700">{rpt.admin_comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-neutral-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                <Star size={48} className="mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-600 font-medium">{t('profile:reviews.noReviews')}</p>
                <p className="text-neutral-400 text-sm mt-1">{t('profile:reviews.noReviewsHint')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <Link
                    key={review.id}
                    to={`/restaurant/${review.restaurant_id}`}
                    className="block bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 mb-1">
                          {review.restaurants?.name_zh || review.restaurants?.name || t('common:unknown')}
                          {review.is_hidden && (
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                              {t('common:hidden')}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                size={14}
                                className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-neutral-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-neutral-600 line-clamp-2">{review.comment}</p>
                        )}
                        {(review.images && review.images.length > 0) ? (
                          <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {review.images.map((img, idx) => (
                              <img 
                                key={idx}
                                src={img} 
                                alt="Review photo" 
                                className="h-20 w-20 object-cover rounded-lg border border-neutral-200 flex-shrink-0"
                              />
                            ))}
                          </div>
                        ) : review.image_url && (
                          <div className="mt-3">
                            <img 
                              src={review.image_url} 
                              alt="Review photo" 
                              className="h-20 w-20 object-cover rounded-lg border border-neutral-200"
                            />
                          </div>
                        )}
                        
                        {/* Admin Comment for Hidden Reviews */}
                        {review.is_hidden && review.admin_comment && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                             <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle size={14} className="text-red-500" />
                                <p className="text-xs font-medium text-red-700">{t('common:adminComment')}</p>
                             </div>
                             <p className="text-sm text-red-800">{review.admin_comment}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleEditReview(review)
                        }}
                        className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
                        title={t('common:edit')}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleDeleteReview(review.id)
                        }}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title={t('common:delete')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Review Edit Modal */}
        {showReviewModal && editingReview && (
          <ReviewFormModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            onSuccess={handleReviewUpdated}
            review={editingReview}
          />
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
                  toast.success(t('profile:pets.updated'))
                } else {
                  const newPet = await createPet(data as { name: string; type: string; size: PetSize; breed?: string | null })
                  setPets(prev => [newPet, ...prev])
                  toast.success(t('profile:pets.added'))
                }
                setShowPetModal(false)
                setEditingPet(null)
              } catch {
                toast.error(t('common:error'))
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
  const { t } = useTranslation(['profile', 'common'])
  const [name, setName] = useState(pet?.name || '')
  const [type, setType] = useState(pet?.type || 'dog')
  const [size, setSize] = useState<PetSize>(pet?.size || 'medium')
  const [breed, setBreed] = useState(pet?.breed || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error(t('profile:pets.namePlaceholder'))
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
          {pet ? t('profile:pets.editPet') : t('profile:pets.addPet')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">{t('profile:pets.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile:pets.namePlaceholder')}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">{t('profile:pets.type')}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              {PET_TYPES.map(t_type => (
                <option key={t_type} value={t_type}>{t(`profile:pets.types.${t_type}`)}</option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">{t('profile:pets.size')}</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as PetSize)}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              {PET_SIZES.map(s => (
                <option key={s.value} value={s.value}>{t(`profile:pets.sizes.${s.value}`)}</option>
              ))}
            </select>
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">{t('profile:pets.breed')}</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder={t('profile:pets.breedPlaceholder')}
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
              {t('common:cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? t('common:loading') : t('common:save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
