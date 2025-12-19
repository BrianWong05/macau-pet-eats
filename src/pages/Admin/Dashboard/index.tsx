import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { StatsGrid } from '@/components/Admin/Dashboard/StatsGrid'

export function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    pendingRestaurants: 0,
    pendingReports: 0,
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
          { count: pendingReports },
          { count: reviews }
        ] = await Promise.all([
          supabase.from('restaurants').select('*', { count: 'exact', head: true }),
          supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('restaurant_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('reviews').select('*', { count: 'exact', head: true })
        ])

        setStats({
          totalRestaurants: total || 0,
          activeRestaurants: active || 0,
          pendingRestaurants: pending || 0,
          pendingReports: pendingReports || 0,
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">{t('admin.dashboard.title')}</h1>
      
      <StatsGrid stats={stats} isLoading={isLoading} />
    </div>
  )
}
