import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import type { Restaurant } from '@/types/database'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import { DetailHeader } from '@/components/RestaurantDetail/DetailHeader'
import { HeroImage } from '@/components/RestaurantDetail/HeroImage'
import { ActionButtons } from '@/components/RestaurantDetail/ActionButtons'
import { InfoCard } from '@/components/RestaurantDetail/InfoCard'
import { SocialMediaSection } from '@/components/RestaurantDetail/SocialMediaSection'
import { OpeningHours } from '@/components/RestaurantDetail/OpeningHours'
import { MenuSection } from '@/components/RestaurantDetail/MenuSection'
import { MapEmbed } from '@/components/RestaurantDetail/MapEmbed'
import { PhotoGallery } from '@/components/RestaurantDetail/PhotoGallery'
import { ReviewsSection } from '@/components/RestaurantDetail/ReviewsSection'
import { ReportModal } from '@/components/RestaurantDetail/ReportModal'
import { DetailFooter } from '@/components/RestaurantDetail/DetailFooter'
import { LoadingState } from '@/components/RestaurantDetail/LoadingState'
import { ErrorState } from '@/components/RestaurantDetail/ErrorState'

export function RestaurantDetail() {
  const { id } = useParams<{ id: string }>()
  const { i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en' | 'pt'
  const { user, isAdmin } = useAuth()
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function fetchRestaurant() {
      if (!id) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const { data, error: fetchError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single()
        
        if (fetchError) throw fetchError
        setRestaurant(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load restaurant'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRestaurant()
  }, [id])

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !restaurant) {
    return <ErrorState error={error || 'Restaurant not found'} />
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <DetailHeader 
        isScrolled={isScrolled} 
        onLoginClick={() => setShowAuthModal(true)} 
      />

      <HeroImage 
        restaurant={restaurant} 
        lang={lang} 
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ActionButtons 
          restaurant={restaurant} 
          onReportClick={() => setShowReportModal(true)} 
          isAdmin={isAdmin}
        />

        <InfoCard 
          restaurant={restaurant} 
          lang={lang} 
        />

        <SocialMediaSection restaurant={restaurant} />

        <OpeningHours restaurant={restaurant} />

        <MenuSection restaurant={restaurant} />

        <MapEmbed 
          restaurant={restaurant} 
          lang={lang} 
        />

        <PhotoGallery 
          restaurant={restaurant} 
          lang={lang} 
        />

        <ReviewsSection 
          restaurantId={restaurant.id} 
          lang={lang} 
          onAuthRequired={() => setShowAuthModal(true)} 
        />
      </div>

      <DetailFooter />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        restaurantId={restaurant.id}
        userId={user?.id}
      />
    </div>
  )
}
