import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Flag } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

import { useAuth } from '@/contexts/AuthContext'
import { ReportFilter } from '@/components/Admin/Reports/ReportFilter'
import { ReportList, type ReportWithRestaurant } from '@/components/Admin/Reports/ReportList'

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
      const updateData: Record<string, string | string[]> = {}
      
      // Handle array fields like cuisine_type
      if (report.field_name === 'cuisine_type') {
        // If value contains commas, split into array; otherwise wrap in array
        const values = report.suggested_value.includes(',')
          ? report.suggested_value.split(',').map(v => v.trim())
          : [report.suggested_value.trim()]
        updateData[report.field_name] = values
      } else {
        updateData[report.field_name] = report.suggested_value
      }
      
      const { error: updateError } = await supabase
        .from('restaurants')
        .update(updateData as never)
        .eq('id', report.restaurant_id)

      if (updateError) throw updateError

      // Mark report as approved
      const { error: reportError } = await supabase
        .from('restaurant_reports')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        } as never)
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
        } as never)
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

  // Mark as checked without updating the restaurant (admin manually handled it)
  const handleCheck = async (reportId: string) => {
    setProcessingId(reportId)
    try {
      const { error } = await supabase
        .from('restaurant_reports')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        } as never)
        .eq('id', reportId)

      if (error) throw error

      toast.success(t('admin.reports.checkSuccess'))
      fetchReports()
    } catch (err) {
      console.error('Check error:', err)
      toast.error(t('admin.reports.checkError'))
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
          <Flag className="text-primary-500" />
          {t('admin.reports.title')}
        </h1>
      </div>

      <ReportFilter 
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <ReportList 
        reports={reports}
        isLoading={isLoading}
        processingId={processingId}
        onApprove={handleApprove}
        onReject={handleReject}
        onCheck={handleCheck}
      />
    </div>
  )
}
