import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, RefreshCw, History, TrendingUp, X, CheckCircle } from 'lucide-react'
import {
  useListTrustScoresQuery,
  useOverrideTrustScoreMutation,
  useRecalculateTrustScoreMutation,
  useGetTrustHistoryQuery,
  type TrustScoreEntry
} from '../api/adminTrustApi'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function TrustScorePage() {
  const { t } = useTranslation()
  const { data, isLoading } = useListTrustScoresQuery({})
  const [overrideScore] = useOverrideTrustScoreMutation()
  const [recalculate, { isLoading: isRecalculating }] = useRecalculateTrustScoreMutation()
  
  // Modals state
  const [overrideId, setOverrideId] = useState<string | null>(null)
  const [historyOrg, setHistoryOrg] = useState<{ id: string; name: string } | null>(null)
  const [form, setForm] = useState({ score: '', reason: '' })

  const handleOverride = async () => {
    if (!overrideId) return
    await overrideScore({ orgId: overrideId, score: Number(form.score), reason: form.reason })
    setOverrideId(null)
    setForm({ score: '', reason: '' })
  }

  const getGrade = (s: number) => s >= 80 ? 'AAA' : s >= 70 ? 'AA' : s >= 60 ? 'A' : s >= 50 ? 'BBB' : s >= 40 ? 'BB' : 'B'
  const gradeColor = (s: number) => s >= 60 ? 'text-green-600 bg-green-50 border border-green-100' : s >= 40 ? 'text-amber-600 bg-amber-50 border border-amber-100' : 'text-red-600 bg-red-50 border border-red-100'

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('trust.title')}</h1>
        <p className="text-slate-500 text-sm mt-1">Superviser et ajuster les scores de confiance des organisations de la plateforme</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Organisation', t('trust.score'), 'Grade', 'Codes de motif', 'Date de mise à jour', t('common.actions')].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Chargement des scores...</td></tr>}
            {!isLoading && data?.data.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Aucun score disponible</td></tr>
            )}
            {data?.data.map((ts) => (
              <tr key={ts.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-semibold text-slate-900">{ts.org.name}</td>
                <td className="px-5 py-4">
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-bold text-slate-900 text-base">{ts.score}</span>
                    <span className="text-slate-400 text-xs">/100</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${gradeColor(ts.score)}`}>
                    {getGrade(ts.score)}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-500 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {ts.reasonCodes && ts.reasonCodes.length > 0 ? (
                      ts.reasonCodes.map((code) => (
                        <span key={code} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                          {code}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-500">{new Date(ts.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setHistoryOrg(ts.org)}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors text-xs font-semibold"
                      title="Historique des scores"
                    >
                      <History size={13} />
                      Historique
                    </button>
                    <button
                      onClick={() => setOverrideId(ts.org.id)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-xs font-semibold"
                    >
                      <SlidersHorizontal size={13} />
                      {t('trust.override')}
                    </button>
                    <button
                      onClick={() => recalculate(ts.org.id)}
                      disabled={isRecalculating}
                      className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 transition-colors text-xs font-semibold disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={isRecalculating ? 'animate-spin' : ''} />
                      Recalculer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* OVERRIDE MODAL */}
      {overrideId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">{t('trust.override')}</h3>
              <button onClick={() => setOverrideId(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nouveau Score</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.score}
                  onChange={(e) => setForm(f => ({ ...f, score: e.target.value }))}
                  placeholder="Ex: 85 (0-100)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Justification Obligatoire</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Raison de la modification forcée..."
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setOverrideId(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 font-medium text-slate-600"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleOverride}
                disabled={!form.score || !form.reason.trim()}
                className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 font-semibold"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL WITH LINE CHART */}
      {historyOrg && <HistoryModal org={historyOrg} onClose={() => setHistoryOrg(null)} getGrade={getGrade} gradeColor={gradeColor} />}
    </div>
  )
}

interface HistoryModalProps {
  org: { id: string; name: string }
  onClose: () => void
  getGrade: (s: number) => string
  gradeColor: (s: number) => string
}

function HistoryModal({ org, onClose, getGrade, gradeColor }: HistoryModalProps) {
  const { data: history, isLoading } = useGetTrustHistoryQuery(org.id)

  const sortedHistory = [...(history ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const chartData = sortedHistory.map(entry => ({
    date: new Date(entry.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    score: entry.score
  }))

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Historique des Trust Scores</h3>
            <p className="text-slate-500 text-xs mt-0.5">Organisation: <span className="font-semibold text-slate-700">{org.name}</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-slate-400 animate-pulse text-sm">Chargement de l'historique...</div>
            </div>
          ) : sortedHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Aucun historique disponible pour cette organisation.</div>
          ) : (
            <>
              {/* Chart */}
              <div className="bg-slate-50 rounded-xl border border-slate-200/60 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={15} className="text-brand-500" />
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Évolution temporelle</h4>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip formatter={(v: number) => [v, 'Score']} labelFormatter={(l) => `Date : ${l}`} />
                      <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1.5 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table list of score events */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mises à jour successives</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Score</th>
                        <th className="px-4 py-2">Grade</th>
                        <th className="px-4 py-2">Codes de motif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...sortedHistory].reverse().map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-slate-500">{new Date(entry.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{entry.score}/100</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${gradeColor(entry.score)}`}>
                              {getGrade(entry.score)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            <div className="flex flex-wrap gap-1">
                              {entry.reasonCodes && entry.reasonCodes.length > 0 ? (
                                entry.reasonCodes.map((c) => (
                                  <span key={c} className="px-1 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                                    {c}
                                  </span>
                                ))
                              ) : (
                                <span>—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
