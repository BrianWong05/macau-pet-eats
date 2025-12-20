
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Star, Camera, X, Loader } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ReviewFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  review: {
    id: string
    rating: number
    comment: string | null
    image_url: string | null
    images: string[] | null
    created_at: string
  }
}

export function ReviewFormModal({ isOpen, onClose, onSuccess, review }: ReviewFormModalProps) {
  const { user } = useAuth()
  const { t } = useTranslation(['profile', 'common', 'restaurant', 'submit'])
  const [rating, setRating] = useState(review.rating)
  const [comment, setComment] = useState(review.comment || '')
  
  // Image state
  // Existing images from DB (images array, fallback to image_url)
  const [existingImages, setExistingImages] = useState<string[]>(
    review.images && review.images.length > 0 
      ? review.images 
      : review.image_url 
        ? [review.image_url] 
        : []
  )
  // Images marked for deletion (if needed for cleanup later, currently just unlinking)
  // const [removedImages, setRemovedImages] = useState<string[]>([])
  // New files to upload
  const [newImages, setNewImages] = useState<File[]>([])
  // Previews for new files
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Reset state when review changes
    if (isOpen) {
      setRating(review.rating)
      setComment(review.comment || '')
      setExistingImages(
        review.images && review.images.length > 0 
          ? review.images 
          : review.image_url 
            ? [review.image_url] 
            : []
      )
      // setRemovedImages([])
      setNewImages([])
      setNewImagePreviews(prev => {
        prev.forEach(url => URL.revokeObjectURL(url))
        return []
      })
      setError(null)
    }
  }, [review, isOpen])

  useEffect(() => {
    // Cleanup previews on unmount
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [newImagePreviews])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const selectedFiles = Array.from(files)
    
    // Size check
    const oversized = selectedFiles.some(f => f.size > 5 * 1024 * 1024)
    if (oversized) {
      toast.error(t('submit:form.uploadHint') || 'Max 5MB')
      return
    }

    setNewImages(prev => [...prev, ...selectedFiles])
    
    // Generate previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
    setNewImagePreviews(prev => [...prev, ...newPreviews])
    
    // Reset file input
    e.target.value = ''
  }

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url))
    // setRemovedImages(prev => [...prev, url])
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => {
      const urlToRemove = prev[index]
      URL.revokeObjectURL(urlToRemove)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (rating === 0) {
      setError(t('profile:reviews.ratingRequired'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Upload new images
      const uploadedUrls: string[] = []
      
      for (const file of newImages) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(fileName)
          
        uploadedUrls.push(publicUrl)
      }

      // 2. Combine existing (minus removed) + new uploads
      const finalImages = [...existingImages, ...uploadedUrls]

      // 3. Update DB
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          rating,
          comment: comment || null,
          images: finalImages,
          image_url: finalImages.length > 0 ? finalImages[0] : null
        } as never)
        .eq('id', review.id)

      if (updateError) throw updateError

      toast.success(t('profile:reviews.updated'))
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Update review error:', err)
      setError(t('common:error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-neutral-900">
            {t('profile:reviews.updateReview')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {error}
            </div>
          )}

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              {t('profile:reviews.yourRating')}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-neutral-200 fill-neutral-200'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              {t('profile:reviews.yourReview')}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('profile:reviews.commentPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none h-32 transition-all outline-none"
            />
          </div>

          {/* Images */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-700 block">
              {t('profile:reviews.addPhoto')} ({existingImages.length + newImages.length}/5)
            </label>
            
            {/* Image Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Existing Images */}
              {existingImages.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-square group">
                  <img
                    src={url}
                    alt={`Review ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-neutral-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-md text-neutral-500 hover:text-red-500 hover:bg-red-50 transition-colors border border-neutral-100 opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* New Image Previews */}
              {newImagePreviews.map((url, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square group">
                  <img
                    src={url}
                    alt="New upload"
                    className="w-full h-full object-cover rounded-lg border border-neutral-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-md text-neutral-500 hover:text-red-500 hover:bg-red-50 transition-colors border border-neutral-100 opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Add Button */}
              {(existingImages.length + newImages.length) < 5 && (
                <label className="aspect-square flex flex-col items-center justify-center gap-2 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-100 hover:border-neutral-300 transition-colors">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Camera size={20} className="text-neutral-400" />
                  </div>
                  <span className="text-xs text-neutral-500 font-medium text-center px-1">{t('profile:reviews.addPhoto')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              {t('profile:reviews.photoHint')}
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 flex gap-3 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {t('common:cancel')}
          </button>
          <button
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader size={18} className="animate-spin" />
                {t('common:processing')}
              </>
            ) : (
              t('profile:reviews.updateReview')
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
