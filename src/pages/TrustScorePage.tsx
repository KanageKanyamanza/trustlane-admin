import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useListTrustScoresQuery, useOverrideTrustScoreMutation, useRecalculateTrustScoreMutation } from '../api/adminTrustApi'

export default function TrustScorePage() {
  const { t } = useTranslation()
  const { data, isLoading } = useListTrustScoresQuery({})
  const [overrideScore] = useOverrideTrustScoreMutation()
  const [recalculate] = useRecalculateTrustScoreMutation()
  const [overrideId, setOverrideId] = useState<string | null>(null)
  const [form, setForm] = useState({ score: '', reason: '' })

  const handleOverride = async () => {
    if (!overrideId) return
    await overrideScore({ orgId: overrideId, score: Number(form.score), reason: form.reason })
    setOverrideId(null)
    setForm({ score: '', reason: '' })
  }

  const getGrade = (s: number) => s >= 80 ? 'AAA' : s >= 70 ? 'AA' : s >= 60 ? 'A' : s >= 50 ? 'BBB' : s >= 40 ? 'BB' : 'B'
  const gradeColor = (s: number) => s >= 60 ? 'text-green-600 bg-green-50' : s >= 40 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">{t('trust.title')}</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Organisation', t('trust.score'), 'Grade', 'Reason codes', 'Date', t('common.actions')].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Chargement...</td></tr>}
            {data?.data.map((ts) => (
              <tr key={ts.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{ts.org.name}</td>
                <td className="px-4 py-3 font-bold text-slate-900">{ts.score}<span className="text-slate-400 font-normal">/100</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(ts.score)}`}>{getGrade(ts.score)}</span></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{ts.reasonCodes.join(', ') || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(ts.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setOverrideId(ts.org.id)}
                      className="text-xs text-blue-600 hover:underline">{t('trust.override')}</button>
                    <button onClick={() => recalculate(ts.org.id)}
                      className="text-xs text-slate-500 hover:underline">{t('trust.recalculate')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {overrideId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-slate-900">{t('trust.override')}</h3>
            <input type="number" min={0} max={100} value={form.score}
              onChange={(e) => setForm(f => ({ ...f, score: e.target.value }))}
              placeholder="Nouveau score (0-100)"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <textarea value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Justification obligatoire"
              className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOverrideId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">{t('common.cancel')}</button>
              <button onClick={handleOverride} disabled={!form.score || !form.reason.trim()}
                className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50">{t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
