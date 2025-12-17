import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Users, 
  Store, 
  CheckCircle,
  Clock 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    pendingRestaurants: 0,
    totalReviews: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: total },
          { count: active },
          { count: pending },
          { count: reviews }
        ] = await Promise.all([
          supabase.from('restaurants').select('*', { count: 'exact', head: true }),
          supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('reviews').select('*', { count: 'exact', head: true })
        ])

        setStats({
          totalRestaurants: total || 0,
          activeRestaurants: active || 0,
          pendingRestaurants: pending || 0,
          totalReviews: reviews || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      label: 'Total Restaurants',
      value: stats.totalRestaurants,
      icon: Store,
      color: 'bg-blue-500'
    },
    {
      label: 'Active Listings',
      value: stats.activeRestaurants,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      label: 'Pending Approval',
      value: stats.pendingRestaurants,
      icon: Clock,
      color: 'bg-amber-500'
    },
    {
      label: 'Total Reviews',
      value: stats.totalReviews,
      icon: Users,
      color: 'bg-purple-500'
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
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">{t('admin.dashboard.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
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
    </div>
  )
}
