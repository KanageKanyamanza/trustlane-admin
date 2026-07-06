import { useTranslation } from 'react-i18next'
import { Building2, Users, FileText, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react'
import {
  useGetOverviewQuery,
  useGetRegistrationsQuery,
  useGetDocsByStatusQuery,
  useGetTrustDistributionQuery,
} from '../api/adminAnalyticsApi'
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const PIE_COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']
const BAR_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#0ea5e9']

function shortMonth(key: string) {
  const [year, month] = key.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data: overview, isLoading } = useGetOverviewQuery()
  const { data: registrations } = useGetRegistrationsQuery()
  const { data: docsByStatus } = useGetDocsByStatusQuery()
  const { data: trustDist } = useGetTrustDistributionQuery()

  const registrationsMapped = (registrations ?? []).map((r) => ({ ...r, label: shortMonth(r.month) }))

  const kpis = [
    { label: t('orgs.title'),        value: overview?.totalOrgs ?? '—',        icon: Building2,   color: 'text-blue-500',   bg: 'bg-blue-50' },
    { label: t('users.title'),       value: overview?.totalUsers ?? '—',       icon: Users,       color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: t('documents.pending'), value: overview?.pendingDocuments ?? '—', icon: FileText,    color: 'text-amber-500',  bg: 'bg-amber-50' },
    { label: 'Trust Score moyen',    value: overview?.avgTrustScore ? `${overview.avgTrustScore}/100` : '—', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('nav.dashboard')}</h1>
        <p className="text-slate-500 text-sm mt-1">Vue globale de la plateforme TrustLane</p>
      </div>

      {/* Alerte critique */}
      {(overview?.criticalAlerts ?? 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-red-700 text-sm font-medium">
            {overview?.criticalAlerts} alerte(s) CRITICAL non acquittée(s) — vérifiez la page Alertes
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse h-28" />
            ))
          : kpis.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-sm">{label}</span>
                  <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={18} className={color} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
              </div>
            ))}
      </div>

      {/* Graphiques row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Inscriptions par mois */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-blue-500" />
            <h3 className="font-semibold text-slate-900">Nouvelles organisations / mois</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={registrationsMapped}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v: number) => [v, 'Orgs']} labelFormatter={(l) => `Mois : ${l}`} />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Documents par statut */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Documents par statut</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={docsByStatus ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                {(docsByStatus ?? []).map((_: unknown, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphiques row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Distribution Trust Score */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Distribution des Trust Scores</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trustDist ?? []} barSize={36}>
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v: number) => [v, 'Organisations']} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(trustDist ?? []).map((_: unknown, i: number) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Résumé rapide */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Résumé plateforme</h3>
          <div className="space-y-0">
            {[
              { label: 'Organisations actives',      value: overview?.totalOrgs,          dot: 'bg-blue-500' },
              { label: 'Utilisateurs inscrits',      value: overview?.totalUsers,         dot: 'bg-purple-500' },
              { label: 'Documents en attente',       value: overview?.pendingDocuments,   dot: 'bg-amber-500' },
              { label: 'Alertes critiques ouvertes', value: overview?.criticalAlerts,     dot: 'bg-red-500' },
              { label: 'Score de confiance moyen',   value: overview?.avgTrustScore != null ? `${overview.avgTrustScore}/100` : '—', dot: 'bg-green-500' },
            ].map(({ label, value, dot }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="text-sm text-slate-600">{label}</span>
                </div>
                <span className="font-semibold text-slate-900 text-sm">{value ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
