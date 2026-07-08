import { useState } from 'react'
import { Search, ShieldOff, ShieldCheck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useListUsersQuery, useUpdateUserMutation, useResetUserPasswordMutation } from '../api/adminUsersApi'
import { useAdminAuth } from '../context/AdminAuthContext'

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-blue-100 text-blue-700',
  FINANCE: 'bg-purple-100 text-purple-700',
  OPS: 'bg-amber-100 text-amber-700',
  ADVISOR: 'bg-teal-100 text-teal-700',
  AUDITOR: 'bg-slate-100 text-slate-700',
}

const ROLES = ['', 'OWNER', 'FINANCE', 'OPS', 'ADVISOR', 'AUDITOR']
const PER_PAGE = 15

export default function UsersPage() {
  const { admin } = useAdminAuth()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [tempPassword, setTempPassword] = useState<{ name: string; pwd: string } | null>(null)

  const { data, isLoading } = useListUsersQuery({ page, search: search || undefined, role: role || undefined })
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation()
  const [resetPassword, { isLoading: resetting }] = useResetUserPasswordMutation()

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 1

  const handleReset = async (id: string, name: string) => {
    const res = await resetPassword(id).unwrap()
    setTempPassword({ name, pwd: res.tempPassword })
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data?.total ?? 0} utilisateur{(data?.total ?? 0) > 1 ? 's' : ''} au total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Rechercher un utilisateur..."
            className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          {ROLES.map(r => <option key={r} value={r}>{r || 'Tous les rôles'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Nom', 'Email', 'Rôle', 'Organisation', 'Statut', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Aucun utilisateur trouvé</td></tr>
            )}
            {data?.data.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] ?? 'bg-slate-100 text-slate-600'}`}>{user.role}</span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{user.org.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {user.isBlocked ? 'Bloqué' : 'Actif'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateUser({ id: user.id, isBlocked: !user.isBlocked })}
                      disabled={updating}
                      title={user.isBlocked ? 'Débloquer' : 'Bloquer'}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${user.isBlocked ? 'text-green-500 hover:bg-green-50' : 'text-amber-500 hover:bg-amber-50'}`}
                    >
                      {user.isBlocked ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                    </button>
                    {admin?.isSuperAdmin && (
                      <button
                        onClick={() => handleReset(user.id, `${user.firstName} ${user.lastName}`)}
                        disabled={resetting}
                        title="Réinitialiser le mot de passe"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Page {page} sur {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {tempPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-slate-900">Mot de passe réinitialisé</h3>
            <p className="text-sm text-slate-600">Transmettez ce mot de passe temporaire à <strong>{tempPassword.name}</strong> :</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-900 select-all break-all">
              {tempPassword.pwd}
            </div>
            <p className="text-xs text-amber-600">Ce mot de passe ne sera plus affiché après fermeture.</p>
            <button onClick={() => setTempPassword(null)}
              className="w-full px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
