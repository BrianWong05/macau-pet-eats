import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  className?: string
}

const sizes = {
  sm: 14,
  md: 20,
  lg: 28
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className = ''
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const iconSize = sizes[size]

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value)
    }
  }

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const value = i + 1
        const isFilled = value <= displayRating
        const isHalf = value - 0.5 === displayRating

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={`
              ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
              focus:outline-none disabled:cursor-default
            `}
          >
            <Star
              size={iconSize}
              className={`
                transition-colors
                ${isFilled || isHalf ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'}
                ${interactive && hoverRating >= value ? 'fill-amber-300 text-amber-300' : ''}
              `}
            />
          </button>
        )
      })}
      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-neutral-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
