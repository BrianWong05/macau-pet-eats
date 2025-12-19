import { useTranslation } from 'react-i18next'
import { Dog, Cat, Bird, Rabbit, HelpCircle, Trash2, Edit2 } from 'lucide-react'
import type { UserPet } from '@/types/database'

interface PetProfileCardProps {
  pet: UserPet
  onEdit?: (pet: UserPet) => void
  onDelete?: (petId: string) => void
}

const petIcons = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  other: HelpCircle
}

const sizeLabels = {
  small: 'S',
  medium: 'M',
  large: 'L'
}

const sizeColors = {
  small: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  large: 'bg-red-100 text-red-700'
}

export function PetProfileCard({ pet, onEdit, onDelete }: PetProfileCardProps) {
  const { t } = useTranslation()
  const IconComponent = petIcons[pet.type as keyof typeof petIcons] || petIcons.other

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image or Icon */}
      <div className="aspect-square bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center relative">
        {pet.image_url ? (
          <img
            src={pet.image_url}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <IconComponent size={64} className="text-primary-300" />
        )}
        
        {/* Size badge */}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${sizeColors[pet.size]}`}>
          {sizeLabels[pet.size]}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg text-neutral-900">{pet.name}</h3>
        
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <IconComponent size={16} />
          <span className="capitalize">{pet.type}</span>
          {pet.breed && (
            <>
              <span>•</span>
              <span>{pet.breed}</span>
            </>
          )}
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
            {onEdit && (
              <button
                onClick={() => onEdit(pet)}
                className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Edit2 size={14} />
                {t('common.edit')}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(pet.id)}
                className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 text-sm text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                {t('common.delete')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
