import { useTranslation } from 'react-i18next'
import { Users, Store, CheckCircle, Clock, FileText } from 'lucide-react'

interface Stats {
  totalRestaurants: number
  activeRestaurants: number
  pendingRestaurants: number
  pendingReports: number
  totalReviews: number
}

interface StatsGridProps {
  stats: Stats
  isLoading: boolean
}

import { useNavigate } from 'react-router-dom'

// ... existing imports

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  const { t } = useTranslation(['admin'])
  const navigate = useNavigate()

  const statCards = [
    {
      label: t('admin:dashboard.totalRestaurants') || 'Total Restaurants',
      value: stats.totalRestaurants,
      icon: Store,
      color: 'bg-blue-500',
      path: '/admin/restaurants'
    },
    {
      label: t('admin:dashboard.activeListings') || 'Active Listings',
      value: stats.activeRestaurants,
      icon: CheckCircle,
      color: 'bg-green-500',
      path: '/admin/restaurants'
    },
    {
      label: t('admin:dashboard.pendingApproval') || 'Pending Approval',
      value: stats.pendingRestaurants,
      icon: Clock,
      color: 'bg-amber-500',
      path: '/admin/restaurants'
    },
    {
      label: t('admin:dashboard.updateReports') || 'Update Reports',
      value: stats.pendingReports,
      icon: FileText,
      color: 'bg-orange-500',
      path: '/admin/reports'
    },
    {
      label: t('admin:dashboard.totalReviews') || 'Total Reviews',
      value: stats.totalReviews,
      icon: Users,
      color: 'bg-purple-500',
      path: null
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-2xl shadow-sm animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <div 
          key={stat.label} 
          onClick={() => stat.path && navigate(stat.path)}
          className={`bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 transition-all ${
            stat.path ? 'cursor-pointer hover:shadow-md active:scale-95' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-neutral-900">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
