import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, ShieldOff, ShieldCheck } from 'lucide-react'
import { useListOrgsQuery, useSuspendOrgMutation } from '../api/adminOrgsApi'

export default function OrganizationsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useListOrgsQuery({ page, search: search || undefined })
  const [suspendOrg] = useSuspendOrgMutation()

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('orgs.title')}</h1>
        <span className="text-slate-500 text-sm">{data?.total ?? 0} total</span>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder={t('common.search')}
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {[t('orgs.name'), t('orgs.owner'), 'Trust Score', t('common.status'), t('common.createdAt'), ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Chargement...</td></tr>
            )}
            {data?.data.map((org) => (
              <tr key={org.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{org.name}</td>
                <td className="px-4 py-3 text-slate-600">{org.owner?.email ?? '—'}</td>
                <td className="px-4 py-3">
                  {org.trustScore
                    ? <span className="font-semibold text-slate-900">{org.trustScore.score}<span className="text-slate-400 font-normal">/100</span></span>
                    : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${org.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {org.isSuspended ? t('common.suspended') : t('common.active')}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(org.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => suspendOrg({ id: org.id, suspend: !org.isSuspended })}
                      className={`p-1.5 rounded-lg transition-colors ${org.isSuspended ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                      title={org.isSuspended ? t('orgs.reactivate') : t('orgs.suspend')}
                    >
                      {org.isSuspended ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                    </button>
                    <Link to={`/organizations/${org.id}`} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.total > data.pageSize && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-slate-50">Précédent</button>
          <span className="px-3 py-1.5 text-sm text-slate-500">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={data.data.length < data.pageSize}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-slate-50">Suivant</button>
        </div>
      )}
    </div>
  )
}
