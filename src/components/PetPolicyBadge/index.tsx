import type { PetPolicy } from '@/types/database'
import { PET_POLICY_LABELS } from '@/types/database'
import { PawPrint, TreePine, Dog, Cat, Heart } from 'lucide-react'

interface PetPolicyBadgeProps {
  policy: PetPolicy
  size?: 'sm' | 'md' | 'lg'
}

const policyConfig: Record<PetPolicy, { icon: typeof PawPrint; colorClass: string }> = {
  indoors_allowed: {
    icon: Heart,
    colorClass: 'bg-secondary-100 text-secondary-700 border-secondary-200',
  },
  patio_only: {
    icon: TreePine,
    colorClass: 'bg-accent-100 text-accent-700 border-accent-200',
  },
  small_pets_only: {
    icon: PawPrint,
    colorClass: 'bg-primary-100 text-primary-700 border-primary-200',
  },
  all_pets_welcome: {
    icon: Heart,
    colorClass: 'bg-secondary-100 text-secondary-700 border-secondary-200',
  },
  dogs_only: {
    icon: Dog,
    colorClass: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  cats_only: {
    icon: Cat,
    colorClass: 'bg-purple-100 text-purple-700 border-purple-200',
  },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
}

export function PetPolicyBadge({ policy, size = 'md' }: PetPolicyBadgeProps) {
  const config = policyConfig[policy]
  const Icon = config.icon

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 
        font-medium rounded-full border
        ${config.colorClass}
        ${sizeClasses[size]}
      `}
    >
      <Icon size={iconSizes[size]} />
      <span>{PET_POLICY_LABELS[policy]}</span>
    </span>
  )
}
