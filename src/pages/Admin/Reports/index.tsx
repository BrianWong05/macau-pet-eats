import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Flag, X, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

import { useAuth } from '@/contexts/AuthContext'
import { ReportFilter } from '@/components/Admin/Reports/ReportFilter'
import { ReportList, type ReportWithRestaurant } from '@/components/Admin/Reports/ReportList'
import { Pagination } from '@/components/Pagination'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function AdminReports() {
  const { t } = useTranslation(['admin', 'search', 'common'])
  const { user } = useAuth()
  const [reports, setReports] = useState<ReportWithRestaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  
  // Edit modal state
  const [editingReport, setEditingReport] = useState<ReportWithRestaurant | null>(null)
  const [editValue, setEditValue] = useState('')

  // Comment modal state
  interface PendingAction {
    type: 'approve' | 'reject' | 'check'
    report: ReportWithRestaurant
  }
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [comment, setComment] = useState('')

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

    const { data: reportsData, error } = await query

    if (!error && reportsData) {
      // Cast explicitly to handle potential type inference issues
      const reports = reportsData as any[]
      
      // Fetch profiles for these reports
      const rawUserIds = reports.map(r => r.user_id)

      // Ensure we only have valid string UUIDs
      const userIds = Array.from(new Set(
        rawUserIds.filter((id: any): id is string => 
          typeof id === 'string' && 
          id.trim().length > 0 && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        )
      ))
      
      let profilesMap: Record<string, any> = {}
      
      if (userIds.length > 0) {
        try {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', userIds)
          
          if (profilesError) {
            console.error('Error fetching profiles:', profilesError)
          }

          if (profilesData) {
            const profiles = profilesData as any[]
            profilesMap = profiles.reduce((acc, profile) => ({
              ...acc,
              [profile.id]: profile
            }), {})
          }
        } catch (err) {
          console.error('Exception fetching profiles:', err)
        }
      }

      // Attach profiles to reports
      const reportsWithProfiles = reports.map(report => ({
        ...report,
        profile: report.user_id ? profilesMap[report.user_id] : undefined
      }))

      setReports(reportsWithProfiles as ReportWithRestaurant[])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchReports()
  }, [filterStatus])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, itemsPerPage])

  const totalPages = Math.ceil(reports.length / itemsPerPage)
  
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return reports.slice(startIndex, startIndex + itemsPerPage)
  }, [reports, currentPage, itemsPerPage])

  const handleEdit = (report: ReportWithRestaurant) => {
    setEditingReport(report)
    setEditValue(report.suggested_value)
  }

  const handleSaveEdit = async () => {
    if (!editingReport) return
    
    setProcessingId(editingReport.id)
    try {
      const { error } = await supabase
        .from('restaurant_reports')
        .update({ suggested_value: editValue } as never)
        .eq('id', editingReport.id)
      
      if (error) throw error
      
      toast.success(t('admin:reports.editSuccess') || '已更新')
      setEditingReport(null)
      fetchReports()
    } catch (err) {
      console.error('Edit error:', err)
      toast.error(t('admin:reports.editError') || '更新失敗')
    } finally {
      setProcessingId(null)
    }
  }

  const handleApprove = async (report: ReportWithRestaurant, adminComment?: string) => {
    setProcessingId(report.id)
    try {
      // Handle special field types
      if (report.field_name === 'image' || report.field_name === 'menu') {
        // Image/menu reports need to append to existing array columns
        const columnName = report.field_name === 'image' ? 'gallery_images' : 'menu_images'
        const newValues = report.suggested_value.split(',').filter(Boolean)
        
        // First get current values
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select(columnName)
          .eq('id', report.restaurant_id)
          .single()
        
        const currentValues: string[] = restaurant ? (restaurant as Record<string, string[]>)[columnName] || [] : []
        const updatedValues = [...currentValues, ...newValues]
        
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({ [columnName]: updatedValues } as never)
          .eq('id', report.restaurant_id)
        
        if (updateError) throw updateError
      } else {
        // Regular field update
        const updateData: Record<string, string | string[]> = {}
        
        // Handle array fields like cuisine_type
        if (report.field_name === 'cuisine_type') {
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
      }

      // Mark report as approved
      const { error: reportError } = await supabase
        .from('restaurant_reports')
        .update({
          status: 'approved',
          admin_comment: adminComment || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        } as never)
        .eq('id', report.id)

      if (reportError) throw reportError
 
      toast.success(t('admin:reports.approveSuccess'))
      fetchReports()
    } catch (err) {
      console.error('Approve error:', err)
      toast.error(t('admin:reports.approveError'))
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (reportId: string, adminComment?: string) => {
    setProcessingId(reportId)
    try {
      const { error } = await supabase
        .from('restaurant_reports')
        .update({
          status: 'rejected',
          admin_comment: adminComment || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        } as never)
        .eq('id', reportId)

      if (error) throw error
 
      toast.success(t('admin:reports.rejectSuccess'))
      fetchReports()
    } catch (err) {
      console.error('Reject error:', err)
      toast.error(t('admin:reports.rejectError'))
    } finally {
      setProcessingId(null)
    }
  }

  const openApproveModal = (report: ReportWithRestaurant) => {
    setPendingAction({ type: 'approve', report })
    setComment('')
  }

  const openRejectModal = (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (report) {
      setPendingAction({ type: 'reject', report })
      setComment('')
    }
  }

  const openCheckModal = (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (report) {
      setPendingAction({ type: 'check', report })
      setComment('')
    }
  }

  const confirmAction = async () => {
    if (!pendingAction) return

    if (pendingAction.type === 'approve') {
      await handleApprove(pendingAction.report, comment || undefined)
    } else if (pendingAction.type === 'reject') {
      await handleReject(pendingAction.report.id, comment || undefined)
    } else if (pendingAction.type === 'check') {
      await handleCheck(pendingAction.report.id, comment || undefined)
    }

    setPendingAction(null)
    setComment('')
  }

  const handleCheck = async (reportId: string, adminComment?: string) => {
    setProcessingId(reportId)
    try {
      const { error } = await supabase
        .from('restaurant_reports')
        .update({
          status: 'approved',
          admin_comment: adminComment || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        } as never)
        .eq('id', reportId)

      if (error) throw error
 
      toast.success(t('admin:reports.checkSuccess'))
      fetchReports()
    } catch (err) {
      console.error('Check error:', err)
      toast.error(t('admin:reports.checkError'))
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
          <Flag className="text-primary-500" />
          {t('admin:reports.title')}
        </h1>
      </div>
 
      <ReportFilter 
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />
 
      {/* Per-page selector */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {t('search:results', { count: reports.length })}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="reports-page-size" className="text-sm text-neutral-500">
            {t('search:perPage')}:
          </label>
          <select
            id="reports-page-size"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <ReportList 
        reports={paginatedReports}
        isLoading={isLoading}
        processingId={processingId}
        onApprove={openApproveModal}
        onReject={openRejectModal}
        onCheck={openCheckModal}
        onEdit={handleEdit}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Edit Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">
                {t('admin:reports.editTitle') || '編輯回報'}
              </h2>
              <button
                onClick={() => setEditingReport(null)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X size={20} className="text-neutral-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t('admin:reports.fieldLabel')}: {editingReport.field_name}
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {(editingReport.field_name === 'image' || editingReport.field_name === 'menu') 
                    ? (t('admin:reports.images') || '圖片')
                    : t('admin:reports.suggestedValue')}
                </label>
                
                {!(editingReport.field_name === 'image' || editingReport.field_name === 'menu') && (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                )}

                {/* Image Previews */}
                {(editingReport.field_name === 'image' || editingReport.field_name === 'menu') && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editValue.split(',').filter(Boolean).map((url, idx) => {
                      const cleanUrl = url.trim()
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl)
                      
                      if (isImage) {
                        return (
                          <div key={idx} className="relative group w-20 h-20">
                            <img 
                              src={cleanUrl} 
                              alt="" 
                              className="w-full h-full object-cover rounded-lg border border-neutral-200" 
                            />
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {/* Enlarge */}
                              <button
                                type="button"
                                onClick={() => window.open(cleanUrl, '_blank')}
                                className="p-1 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
                                title={t('common:view') || '查看'}
                              >
                                <ExternalLink size={14} />
                              </button>
                              
                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => {
                                  // Remove URL from comma-separated string
                                  const urls = editValue.split(',').map(u => u.trim()).filter(Boolean)
                                  const newUrls = urls.filter(u => u !== cleanUrl)
                                  setEditValue(newUrls.join(','))
                                }}
                                className="p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                                title={t('common:delete') || '刪除'}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium transition-colors"
                >
                  {t('common:cancel')}
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={processingId === editingReport.id}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {processingId === editingReport.id ? '...' : t('common:save') || '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                {t('admin:comment.title') || 'Add Comment'}
              </h3>
              <button
                onClick={() => setPendingAction(null)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X size={18} className="text-neutral-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm text-neutral-600 mb-2">
                  {t('admin:comment.hint') || 'Add a comment for the user (optional)'}
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('admin:comment.placeholder') || 'Enter your response...'}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingAction(null)}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  {t('common:cancel')}
                </button>
                <button
                  onClick={confirmAction}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                  {pendingAction.type === 'approve' 
                    ? t('admin:reports.approve')
                    : pendingAction.type === 'check' 
                      ? t('admin:reports.check') 
                      : t('admin:reports.reject')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
