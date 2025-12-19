import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Bug, Lightbulb, MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

const FEEDBACK_TYPES = [
  { value: 'bug', icon: Bug, color: 'text-red-500 bg-red-50' },
  { value: 'feature', icon: Lightbulb, color: 'text-amber-500 bg-amber-50' },
  { value: 'general', icon: MessageCircle, color: 'text-blue-500 bg-blue-50' }
] as const

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { t } = useTranslation(['feedback', 'common'])
  const { user } = useAuth()
  const [type, setType] = useState<'bug' | 'feature' | 'general'>('general')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('app_feedback')
        .insert({
          user_id: user?.id || null,
          type,
          message: message.trim(),
          contact_email: email || user?.email || null,
          page_url: window.location.href
        } as never)

      if (error) throw error

      toast.success(t('feedback:success') || 'Thanks for your feedback!')
      setMessage('')
      setEmail('')
      setType('general')
      onClose()
    } catch (err) {
      console.error('Feedback submission error:', err)
      toast.error(t('feedback:error') || 'Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-neutral-900">
            {t('feedback:title') || 'Send Feedback'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('feedback:typeLabel') || 'What type of feedback?'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FEEDBACK_TYPES.map((ft) => (
                <button
                  key={ft.value}
                  type="button"
                  onClick={() => setType(ft.value)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    type === ft.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`p-2 rounded-full ${ft.color}`}>
                    <ft.icon size={18} />
                  </div>
                  <span className="text-xs font-medium text-neutral-700">
                    {t(`feedback:types.${ft.value}`) || ft.value}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              {t('feedback:messageLabel') || 'Your message'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder={t('feedback:messagePlaceholder') || 'Tell us what you think...'}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Email (only if not logged in) */}
          {!user && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {t('feedback:emailLabel') || 'Email (optional)'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-neutral-500 mt-1">
                {t('feedback:emailHint') || "We'll only use this to follow up on your feedback"}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {loading ? (t('common:loading') || 'Sending...') : (t('feedback:submit') || 'Send Feedback')}
          </button>
        </form>
      </div>
    </div>
  )
}
