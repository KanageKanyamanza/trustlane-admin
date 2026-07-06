import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { useListUsersQuery, useUpdateUserMutation } from '../api/adminUsersApi'

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-blue-100 text-blue-700',
  FINANCE: 'bg-purple-100 text-purple-700',
  OPS: 'bg-amber-100 text-amber-700',
  ADVISOR: 'bg-teal-100 text-teal-700',
  AUDITOR: 'bg-slate-100 text-slate-700',
}

export default function UsersPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useListUsersQuery({ page, search: search || undefined })
  const [updateUser] = useUpdateUserMutation()

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('users.title')}</h1>
        <span className="text-slate-500 text-sm">{data?.total ?? 0} total</span>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder={t('common.search')}
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Nom', 'Email', t('users.role'), t('users.organization'), t('common.status'), t('common.actions')].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Chargement...</td></tr>}
            {data?.data.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] ?? 'bg-slate-100 text-slate-600'}`}>{user.role}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.org.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {user.isBlocked ? 'Bloqué' : 'Actif'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => updateUser({ id: user.id, isBlocked: !user.isBlocked })}
                    className="text-xs text-slate-500 hover:text-slate-900 underline"
                  >
                    {user.isBlocked ? t('users.unblock') : t('users.block')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
