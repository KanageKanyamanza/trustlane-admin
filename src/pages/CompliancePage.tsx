import { useTranslation } from 'react-i18next'
import { useListComplianceTemplatesQuery, useGetComplianceStatsQuery } from '../api/adminComplianceApi'

export default function CompliancePage() {
  const { t } = useTranslation()
  const { data: templates } = useListComplianceTemplatesQuery()
  const { data: stats } = useGetComplianceStatsQuery()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t('nav.compliance')}</h1>

      {/* Stats globaux */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-slate-500 text-sm">Organisations</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalOrgs}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-slate-500 text-sm">Checklists</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalChecklists}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-slate-500 text-sm mb-2">Items par statut</p>
            <div className="space-y-1 text-sm">
              {Object.entries(stats.itemsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="text-slate-600">{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="space-y-4">
        <h2 className="font-semibold text-slate-900">Templates de conformité</h2>
        {templates?.map((tpl: { id: string; market: string; requirements: string[] }) => (
          <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-medium text-slate-900 mb-3">{tpl.market}</h3>
            <ul className="space-y-1">
              {tpl.requirements.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-slate-400 mt-0.5">·</span>{r}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
