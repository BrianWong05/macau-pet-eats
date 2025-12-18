import { useTranslation } from 'react-i18next'
import { Clock } from 'lucide-react'
import type { Restaurant, DayOfWeek, OpeningHours as OpeningHoursType, DayHours } from '@/types/database'

const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

interface OpeningHoursProps {
  restaurant: Restaurant
}

export function OpeningHours({ restaurant }: OpeningHoursProps) {
  const { t } = useTranslation()

  if (!restaurant.opening_hours) return null

  // Group consecutive days with same hours
  const openingHours = restaurant.opening_hours as OpeningHoursType
  const groups: { days: DayOfWeek[], hours: DayHours | null }[] = []
  
  DAYS_OF_WEEK.forEach((day) => {
    const hours = openingHours[day] || null
    const hoursKey = hours ? `${hours.open}-${hours.close}` : 'closed'
    const lastGroup = groups[groups.length - 1]
    const lastHoursKey = lastGroup?.hours 
      ? `${lastGroup.hours.open}-${lastGroup.hours.close}` 
      : (lastGroup?.hours === null ? 'closed' : null)
    
    if (lastHoursKey === hoursKey) {
      lastGroup.days.push(day)
    } else {
      groups.push({ days: [day], hours })
    }
  })
  
  const getDayLabel = (days: DayOfWeek[]) => {
    if (days.length === 1) {
      return t(`openingHours.days.${days[0]}`)
    }
    if (days.length === 7) {
      return t('openingHours.everyday') || 'Every day'
    }
    const first = t(`openingHours.days.${days[0]}`)
    const last = t(`openingHours.days.${days[days.length - 1]}`)
    return `${first.substring(0, 3)} - ${last.substring(0, 3)}`
  }

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary-500" />
        {t('openingHours.title')}
      </h3>
      <div className="space-y-2">
        {groups.map((group, index) => (
          <div key={index} className="flex justify-between text-sm py-1 border-b border-neutral-100 last:border-0">
            <span className="font-medium text-neutral-700">
              {getDayLabel(group.days)}
            </span>
            <span className={group.hours ? 'text-neutral-600' : 'text-neutral-400'}>
              {group.hours 
                ? `${group.hours.open} - ${group.hours.close}`
                : t('openingHours.closed')
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
