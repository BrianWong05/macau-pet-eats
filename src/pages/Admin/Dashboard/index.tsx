import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Bug, Lightbulb, MessageSquare, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { StatsGrid } from '@/components/Admin/Dashboard/StatsGrid'

interface FeedbackItem {
  id: string
  type: 'bug' | 'feature' | 'general'
  message: string
  status: string
  created_at: string
}

const TYPE_ICONS = {
  bug: Bug,
  feature: Lightbulb,
  general: MessageSquare
}

const TYPE_COLORS = {
  bug: 'text-red-500 bg-red-50',
  feature: 'text-amber-500 bg-amber-50',
  general: 'text-blue-500 bg-blue-50'
}

export function AdminDashboard() {
  const { t } = useTranslation(['admin', 'common'])
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    pendingRestaurants: 0,
    pendingReports: 0,
    totalReviews: 0
  })
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [feedbackCount, setFeedbackCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: total },
          { count: active },
          { count: pending },
          { count: pendingReports },
          { count: reviews },
          { data: recentFeedback },
          { count: feedbackTotal }
        ] = await Promise.all([
          supabase.from('restaurants').select('*', { count: 'exact', head: true }),
          supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('restaurant_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('reviews').select('*', { count: 'exact', head: true }),
          supabase.from('app_feedback').select('id, type, message, status, created_at').order('created_at', { ascending: false }).limit(3),
          supabase.from('app_feedback').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ])

        setStats({
          totalRestaurants: total || 0,
          activeRestaurants: active || 0,
          pendingRestaurants: pending || 0,
          pendingReports: pendingReports || 0,
          totalReviews: reviews || 0
        })
        setFeedbackItems(recentFeedback || [])
        setFeedbackCount(feedbackTotal || 0)
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
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">{t('admin:dashboard.title')}</h1>
      
      <StatsGrid stats={stats} isLoading={isLoading} />

      {/* Recent Feedback Section */}
      <div className="mt-8 bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-neutral-900">{t('admin:feedback.title') || 'User Feedback'}</h2>
            {feedbackCount > 0 && (
              <p className="text-sm text-neutral-500 mt-0.5">
                {feedbackCount} {t('admin:feedback.status.pending') || 'pending'}
              </p>
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/feedback')}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
          >
            {t('common:viewAll') || 'View All'}
            <ArrowRight size={16} />
          </button>
        </div>

        {feedbackItems.length === 0 ? (
          <div className="p-8 text-center text-neutral-400">
            {t('admin:feedback.empty') || 'No feedback yet'}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {feedbackItems.map((item) => {
              const TypeIcon = TYPE_ICONS[item.type]
              return (
                <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-neutral-50 transition-colors">
                  <div className={`p-2 rounded-lg ${TYPE_COLORS[item.type]}`}>
                    <TypeIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900 line-clamp-2">{item.message}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

