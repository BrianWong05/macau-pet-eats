import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, LogOut, User, Upload } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'

export function ProfileHeader() {
  const { t } = useTranslation(['profile', 'restaurant', 'auth', 'common'])
  const { user, username, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between shrink-0 z-20 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          aria-label={t('restaurant:backToList')}
        >
          <ArrowLeft size={20} className="text-neutral-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">
            {username || t('profile:title')}
          </h1>
          {user?.email && (
            <p className="text-sm text-neutral-500 hidden sm:block">
              {user.email}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {user && (
          <>
            <Link
              to="/profile"
              className="p-2 hover:bg-neutral-100 rounded-xl transition-colors text-primary-600"
              title={t('profile:title')}
            >
              <User size={20} />
            </Link>
            <button
              onClick={() => signOut()}
              className="p-2 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-600 hover:text-red-600"
              title={t('auth:logout') || 'Logout'}
            >
              <LogOut size={20} />
            </button>
          </>
        )}
        <Link
          to="/submit"
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">{t('common:nav.submit')}</span>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  )
}
