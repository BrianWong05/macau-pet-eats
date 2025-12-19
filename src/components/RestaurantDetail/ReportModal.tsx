import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  restaurantId?: string
  userId?: string
}

export function ReportModal({ isOpen, onClose, restaurantId, userId }: ReportModalProps) {
  const { t } = useTranslation()
  const [reportField, setReportField] = useState('')
  const [reportValue, setReportValue] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportField || !reportValue) return
    
    setReportLoading(true)
    try {
      const { error } = await supabase
        .from('restaurant_reports')
        .insert({
          restaurant_id: restaurantId,
          user_id: userId || null,
          field_name: reportField,
          suggested_value: reportValue,
          reason: reportReason || null
        } as never)
      
      if (error) throw error
      
      onClose()
      setReportField('')
      setReportValue('')
      setReportReason('')
      alert(t('restaurant.reportModal.success'))
    } catch (err) {
      console.error('Report submission error:', err)
      alert(t('restaurant.reportModal.error'))
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-neutral-900">
            {t('restaurant.reportModal.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              {t('restaurant.reportModal.fieldLabel')}
            </label>
            <select
              value={reportField}
              onChange={(e) => setReportField(e.target.value)}
              required
              onInvalid={e => (e.target as HTMLSelectElement).setCustomValidity(t('restaurant.reportModal.selectField'))}
              onInput={e => (e.target as HTMLSelectElement).setCustomValidity('')}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t('restaurant.reportModal.selectField')}</option>
              <option value="pet_policy">{t('restaurant.reportModal.fields.pet_policy')}</option>
              <option value="contact_info">{t('restaurant.reportModal.fields.contact_info')}</option>
              <option value="address">{t('restaurant.reportModal.fields.address')}</option>
              <option value="cuisine_type">{t('restaurant.reportModal.fields.cuisine_type')}</option>
              <option value="other">{t('restaurant.reportModal.fields.other')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              {t('restaurant.reportModal.suggestedValue')}
            </label>
            <textarea
              value={reportValue}
              onChange={(e) => setReportValue(e.target.value)}
              required
              onInvalid={e => (e.target as HTMLTextAreaElement).setCustomValidity(t('restaurant.reportModal.validation.required'))}
              onInput={e => (e.target as HTMLTextAreaElement).setCustomValidity('')}
              rows={3}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              {t('restaurant.reportModal.reason')}
            </label>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder={t('restaurant.reportModal.reasonPlaceholder')}
              rows={2}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={reportLoading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {reportLoading ? t('common.loading') : t('common.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
