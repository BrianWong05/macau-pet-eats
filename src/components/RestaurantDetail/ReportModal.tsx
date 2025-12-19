import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Upload, Image as ImageIcon, FileText, Link as LinkIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
  
  // For file uploads
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [menuType, setMenuType] = useState<'upload' | 'link'>('upload')
  const [menuLink, setMenuLink] = useState('')
  // Image states
  const [imageType, setImageType] = useState<'upload' | 'link'>('upload')
  const [imageLink, setImageLink] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const isFileField = reportField === 'image' || reportField === 'menu'
  const acceptedTypes = reportField === 'menu' 
    ? 'image/*,.pdf' 
    : 'image/*'

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const newUrls: string[] = []
      
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const folder = reportField === 'menu' ? 'menus' : 'gallery'
        const filePath = `${folder}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('restaurants')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('restaurants')
          .getPublicUrl(filePath)

        newUrls.push(publicUrl)
      }

      setUploadedFiles(prev => [...prev, ...newUrls])
    } catch (err) {
      console.error('Upload error:', err)
      alert(t('common.uploadError') || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate based on field type
    if (!reportField) return
    if (!isFileField && !reportValue) return
    
    // Image Validation
    if (reportField === 'image') {
      if (imageType === 'upload' && uploadedFiles.length === 0) return
      if (imageType === 'link' && !imageLink) return
    }
    
    // Menu Validation
    if (reportField === 'menu') {
       if (menuType === 'upload' && uploadedFiles.length === 0) return
       if (menuType === 'link' && !menuLink) return
    }
    
    setReportLoading(true)
    try {
      // Determine value based on field type
      let finalValue = reportValue
      if (reportField === 'image') {
        finalValue = imageType === 'link' ? imageLink : uploadedFiles.join(',')
      } else if (reportField === 'menu') {
        finalValue = menuType === 'link' ? menuLink : uploadedFiles.join(',')
      }

      const { error } = await supabase
        .from('restaurant_reports')
        .insert({
          restaurant_id: restaurantId,
          user_id: userId || null,
          field_name: reportField,
          suggested_value: finalValue,
          reason: reportReason || null
        } as never)
      
      if (error) throw error
      
      onClose()
      setReportField('')
      setReportValue('')
      setReportReason('')
      setUploadedFiles([])
      setMenuLink('')
      toast.success(t('restaurant.reportModal.success'))
    } catch (err) {
      console.error('Report submission error:', err)
      toast.error(t('restaurant.reportModal.error'))
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" style={{ zIndex: 100 }}>
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
              onChange={(e) => {
                setReportField(e.target.value)
                setUploadedFiles([])
                setMenuLink('')
                setReportValue('')
              }}
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
              <option value="image">{t('restaurant.reportModal.fields.image') || '相片'}</option>
              <option value="menu">{t('restaurant.reportModal.fields.menu') || '菜單'}</option>
              <option value="other">{t('restaurant.reportModal.fields.other')}</option>
            </select>
          </div>

          {/* Image Upload Section */}
          {reportField === 'image' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <ImageIcon size={16} className="inline mr-1" />
                {t('restaurant.reportModal.uploadImages') || '相片'}
              </label>

              {/* Toggle: Upload vs Link */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setImageType('upload')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    imageType === 'upload' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Upload size={14} />
                  {t('common.upload') || '上傳'}
                </button>
                <button
                  type="button"
                  onClick={() => setImageType('link')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    imageType === 'link' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <LinkIcon size={14} />
                  {t('common.link') || '連結'}
                </button>
              </div>
              
              {imageType === 'upload' && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes}
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="report-file-upload"
                  />
                  
                  <label
                    htmlFor="report-file-upload"
                    className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                  >
                    <Upload size={20} className="text-neutral-500" />
                    <span className="text-neutral-600">
                      {uploading ? (t('common.uploading') || '上傳中...') : (t('common.clickToUpload') || '點擊上傳')}
                    </span>
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {uploadedFiles.map((url, index) => (
                        <div key={index} className="relative group">
                          <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {imageType === 'link' && (
                <input
                  type="url"
                  value={imageLink}
                  onChange={(e) => setImageLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>
          )}

          {/* Menu Upload Section */}
          {reportField === 'menu' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <FileText size={16} className="inline mr-1" />
                {t('restaurant.reportModal.menuUpload') || '菜單'}
              </label>
              
              {/* Toggle: Upload vs Link */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setMenuType('upload')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    menuType === 'upload' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Upload size={14} />
                  {t('common.upload') || '上傳'}
                </button>
                <button
                  type="button"
                  onClick={() => setMenuType('link')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    menuType === 'link' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <LinkIcon size={14} />
                  {t('common.link') || '連結'}
                </button>
              </div>

              {menuType === 'upload' && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes}
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="report-menu-upload"
                  />
                  
                  <label
                    htmlFor="report-menu-upload"
                    className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                  >
                    <Upload size={20} className="text-neutral-500" />
                    <span className="text-neutral-600">
                      {uploading ? (t('common.uploading') || '上傳中...') : (t('common.uploadImageOrPdf') || '上傳圖片或 PDF')}
                    </span>
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
                          {url.endsWith('.pdf') ? (
                            <FileText size={20} className="text-red-500" />
                          ) : (
                            <img src={url} alt="" className="w-12 h-12 object-cover rounded" />
                          )}
                          <span className="flex-1 text-sm text-neutral-600 truncate">{url.split('/').pop()}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {menuType === 'link' && (
                <input
                  type="url"
                  value={menuLink}
                  onChange={(e) => setMenuLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>
          )}

          {/* Text value input for non-file fields */}
          {!isFileField && (
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
          )}

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
              disabled={reportLoading || uploading}
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
