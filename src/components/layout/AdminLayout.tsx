import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  LayoutDashboard, Building2, Users, FileText, ShieldCheck,
  ClipboardList, ScrollText, Bell, Settings, UserCog, LogOut,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, key: 'dashboard' },
  { to: '/organizations', icon: Building2,        key: 'organizations' },
  { to: '/users',         icon: Users,            key: 'users' },
  { to: '/documents',     icon: FileText,         key: 'documents' },
  { to: '/trust-scores',  icon: ShieldCheck,      key: 'trustScores' },
  { to: '/compliance',    icon: ClipboardList,    key: 'compliance' },
  { to: '/audit-logs',    icon: ScrollText,       key: 'auditLogs' },
  { to: '/alerts',        icon: Bell,             key: 'alerts' },
  { to: '/system',        icon: Settings,         key: 'system' },
  { to: '/admins',        icon: UserCog,          key: 'admins' },
]

export default function AdminLayout() {
  const { t, i18n } = useTranslation()
  const { admin, logout } = useAdminAuth()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <img src="/logo.png" alt="TrustLane" className="h-8 w-auto rounded-xl" />
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
              {admin?.firstName?.[0]}{admin?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{admin?.firstName} {admin?.lastName}</p>
              <p className="text-slate-500 text-xs truncate">{admin?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors"
            >
              {i18n.language === 'fr' ? 'EN' : 'FR'}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-xs transition-colors"
            >
              <LogOut size={13} />
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
