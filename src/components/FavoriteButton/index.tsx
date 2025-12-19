import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface FavoriteButtonProps {
  restaurantId: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  onAuthRequired?: () => void
}

const sizes = {
  sm: 16,
  md: 20,
  lg: 24
}

export function FavoriteButton({
  restaurantId,
  size = 'md',
  showLabel = false,
  className = '',
  onAuthRequired
}: FavoriteButtonProps) {
  const { t } = useTranslation(['profile', 'common'])
  const { user } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  const [isLoading, setIsLoading] = useState(false)
  
  const isFav = isFavorited(restaurantId)
  const iconSize = sizes[size]

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      if (onAuthRequired) {
        onAuthRequired()
      } else {
        toast.error(t('common:loginRequired'))
      }
      return
    }

    setIsLoading(true)
    try {
      await toggleFavorite(restaurantId)
      toast.success(isFav ? t('profile:favorites.removed') : t('profile:favorites.added'))
    } catch {
      toast.error(t('common:error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-1.5 p-2 rounded-full
        transition-all duration-200
        ${isFav 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200 hover:text-red-400'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={isFav ? t('profile:favorites.remove') : t('profile:favorites.add')}
    >
      <Heart
        size={iconSize}
        className={`
          transition-all duration-200
          ${isFav ? 'fill-red-500' : ''}
          ${isLoading ? 'animate-pulse' : ''}
        `}
      />
      {showLabel && (
        <span className="text-sm font-medium pr-1">
          {isFav ? t('profile:favorites.saved') : t('profile:favorites.save')}
        </span>
      )}
    </button>
  )
}
