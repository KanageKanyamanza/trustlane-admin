import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useListAuditLogsQuery } from '../api/adminAuditApi'

export default function AuditLogsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useListAuditLogsQuery({ page })

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('nav.auditLogs')}</h1>
        <a href="/api/admin/audit-logs/export" className="text-sm text-brand-500 hover:underline">Export CSV</a>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Action', 'Entity', 'User / Admin', 'Organisation', 'Date'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Chargement...</td></tr>}
            {data?.data.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-4 py-3"><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{log.action}</span></td>
                <td className="px-4 py-3 text-slate-600">{log.entityType} <span className="text-slate-400 text-xs">#{log.entityId.slice(0, 8)}</span></td>
                <td className="px-4 py-3 text-slate-600">{log.user?.email ?? log.admin?.email ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{log.org?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-slate-50">Précédent</button>
        <span className="px-3 py-1.5 text-sm text-slate-500">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={(data?.data.length ?? 0) < 20}
          className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-slate-50">Suivant</button>
      </div>
    </div>
  )
}
