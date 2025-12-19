import { Link, Outlet, useLocation } from 'react-router-dom'
import { 
  Store, 
  BarChart, 
  LogOut, 
  Menu,
  X,
  Flag,
  Utensils,
  MessageSquare
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'

export function AdminLayout() {
  const { signOut } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navItems = [
    { path: '/admin', icon: BarChart, label: t('admin.sidebar.dashboard') },
    { path: '/admin/restaurants', icon: Store, label: t('admin.sidebar.restaurants') },
    { path: '/admin/cuisine-types', icon: Utensils, label: t('admin.cuisineTypes.title') },
    { path: '/admin/reports', icon: Flag, label: t('admin.reports.title') },
    { path: '/admin/feedback', icon: MessageSquare, label: t('admin.feedback.title') || 'Feedback' },
  ]

  return (
    <div className="h-screen bg-neutral-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200">
          <span className="text-xl font-bold text-neutral-900">Admin Panel</span>
          <button 
            className="lg:hidden p-1 text-neutral-500 hover:bg-neutral-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-neutral-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors"
          >
            <LogOut size={20} />
            {t('auth.signOut')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="h-16 lg:hidden flex items-center px-4 bg-white border-b border-neutral-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-neutral-900">Admin</span>
        </div>

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
