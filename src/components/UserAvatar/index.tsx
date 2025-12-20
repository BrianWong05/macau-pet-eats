import { useState } from 'react'
import { User } from 'lucide-react'

interface UserAvatarProps {
  user?: {
    name: string | null
    avatar_url: string | null
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function UserAvatar({ user, className = '', size = 'md' }: UserAvatarProps) {
  const [hasError, setHasError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const containerClass = `${sizeClasses[size]} bg-neutral-200 rounded-full flex items-center justify-center text-neutral-500 ${className}`

  if (user?.avatar_url && !hasError) {
    return (
      <img 
        src={user.avatar_url} 
        alt={user.name || 'User'} 
        className={`${sizeClasses[size]} rounded-full object-cover border border-neutral-200 ${className}`}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    )
  }

  return (
    <div className={containerClass}>
      {user?.name ? (
        <span className="font-semibold text-sm">{user.name.charAt(0).toUpperCase()}</span>
      ) : (
        <User className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      )}
    </div>
  )
}
