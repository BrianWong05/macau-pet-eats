import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Clock, ExternalLink, Loader } from 'lucide-react'
import type { RestaurantReport, Restaurant } from '@/types/database'

export interface ReportWithRestaurant extends RestaurantReport {
  restaurant?: Pick<Restaurant, 'id' | 'name' | 'name_zh'>
}

interface ReportListProps {
  reports: ReportWithRestaurant[]
  isLoading: boolean
  processingId: string | null
  onApprove: (report: ReportWithRestaurant) => void
  onReject: (reportId: string) => void
}

export function ReportList({ 
  reports, 
  isLoading, 
  processingId, 
  onApprove, 
  onReject 
}: ReportListProps) {
  const { t } = useTranslation()

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        {t('admin.reports.empty')}
      </div>
    )
  }

  return (
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
                  onClick={() => onApprove(report)}
                  disabled={processingId === report.id}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-neutral-300 text-white rounded-lg font-medium transition-colors"
                >
                  {processingId === report.id ? '...' : t('admin.reports.approve')}
                </button>
                <button
                  onClick={() => onReject(report.id)}
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
  )
}
