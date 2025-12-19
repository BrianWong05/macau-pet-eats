import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageSquarePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FeedbackModal } from './FeedbackModal'

export function FeedbackButton() {
  const { t } = useTranslation()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all group"
        title={t('feedback.title') || 'Send Feedback'}
      >
        <MessageSquarePlus size={24} />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {t('feedback.title') || 'Feedback'}
        </span>
      </button>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

