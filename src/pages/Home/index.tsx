import { useState, useEffect } from 'react'
import { AuthModal } from '@/components/AuthModal'
import { HomeHeader } from '@/components/Home/HomeHeader'
import { HeroSection } from '@/components/Home/HeroSection'
import { FeaturedSection } from '@/components/Home/FeaturedSection'
import { CtaSection } from '@/components/Home/CtaSection'
import { HomeFooter } from '@/components/Home/HomeFooter'
import { useRestaurants } from '@/hooks/useRestaurants'

export function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { restaurants, featuredRestaurants, isLoading, error } = useRestaurants({})

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen">
      <HomeHeader 
        isScrolled={isScrolled} 
        onLoginClick={() => setIsAuthModalOpen(true)} 
      />

      <HeroSection count={restaurants.length} />

      <FeaturedSection 
        featuredRestaurants={featuredRestaurants}
        isLoading={isLoading}
        error={error}
      />

      <CtaSection />

      <HomeFooter />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  )
}
