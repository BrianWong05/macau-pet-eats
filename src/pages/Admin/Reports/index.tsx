import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Loader
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { RestaurantReport, Restaurant } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

interface ReportWithRestaurant extends RestaurantReport {
  restaurant?: Pick<Restaurant, 'id' | 'name' | 'name_zh'>
}

export function AdminReports() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [reports, setReports] = useState<ReportWithRestaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchReports = async () => {
    setIsLoading(true)
    let query = supabase
      .from('restaurant_reports')
      .select(`
        *,
        restaurant:restaurants(id, name, name_zh)
      `)
      .order('created_at', { ascending: false })
    
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }

    const { data, error } = await query

    if (!error && data) {
      setReports(data as ReportWithRestaurant[])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchReports()
  }, [filterStatus])

  const handleApprove = async (report: ReportWithRestaurant) => {
    setProcessingId(report.id)
    try {
      // Update the restaurant field
      const updateData: Record<string, string> = {}
      updateData[report.field_name] = report.suggested_value
      
      const { error: updateError } = await supabase
        .from('restaurants')
        .update(updateData)
        .eq('id', report.restaurant_id)

      if (updateError) throw updateError

      // Mark report as approved
      const { error: reportError } = await supabase
        .from('restaurant_reports')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', report.id)

      if (reportError) throw reportError

      toast.success(t('admin.reports.approveSuccess'))
      fetchReports()
    } catch (err) {
      console.error('Approve error:', err)
      toast.error(t('admin.reports.approveError'))
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (reportId: string) => {
    setProcessingId(reportId)
    try {
      const { error } = await supabase
        .from('restaurant_reports')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', reportId)

      if (error) throw error

      toast.success(t('admin.reports.rejectSuccess'))
      fetchReports()
    } catch (err) {
      console.error('Reject error:', err)
      toast.error(t('admin.reports.rejectError'))
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-amber-500" />
    }
  }

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      pet_policy: t('restaurant.reportModal.fields.pet_policy'),
      contact_info: t('restaurant.reportModal.fields.contact_info'),
      address: t('restaurant.reportModal.fields.address'),
      cuisine_type: t('restaurant.reportModal.fields.cuisine_type'),
      other: t('restaurant.reportModal.fields.other')
    }
    return labels[field] || field
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
          <Flag className="text-primary-500" />
          {t('admin.reports.title')}
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === status
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {t(`admin.reports.status.${status}`)}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          {t('admin.reports.empty')}
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(report.status)}
                    <span className="font-semibold text-neutral-900">
                      {report.restaurant?.name_zh || report.restaurant?.name || 'Unknown'}
                    </span>
                    <a
                      href={`/#/restaurants/${report.restaurant_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-600"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-500">{t('admin.reports.fieldLabel')}:</span>
                      <span className="ml-2 font-medium">{getFieldLabel(report.field_name)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">{t('admin.reports.suggestedValue')}:</span>
                      <span className="ml-2 font-medium text-primary-600">{report.suggested_value}</span>
                    </div>
                  </div>
                  
                  {report.reason && (
                    <p className="mt-2 text-sm text-neutral-600 bg-neutral-50 p-2 rounded-lg">
                      {report.reason}
                    </p>
                  )}
                  
                  <p className="mt-2 text-xs text-neutral-400">
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>

                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(report)}
                      disabled={processingId === report.id}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-neutral-300 text-white rounded-lg font-medium transition-colors"
                    >
                      {processingId === report.id ? '...' : t('admin.reports.approve')}
                    </button>
                    <button
                      onClick={() => handleReject(report.id)}
                      disabled={processingId === report.id}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-neutral-300 text-white rounded-lg font-medium transition-colors"
                    >
                      {processingId === report.id ? '...' : t('admin.reports.reject')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
