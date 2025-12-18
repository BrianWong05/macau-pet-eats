import { useState, useEffect } from 'react'
import { AuthModal } from '@/components/AuthModal'
import { HomeHeader } from '@/components/Home/HomeHeader'
import { HeroSection } from '@/components/Home/HeroSection'
import { FeaturedSection } from '@/components/Home/FeaturedSection'
import { CtaSection } from '@/components/Home/CtaSection'
import { HomeFooter } from '@/components/Home/HomeFooter'

export function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

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

      <HeroSection />

      <FeaturedSection />

      <CtaSection />

      <HomeFooter />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  )
}
