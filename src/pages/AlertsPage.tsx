import { useTranslation } from 'react-i18next'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { useListAlertsQuery, useAcknowledgeAlertMutation } from '../api/adminAlertsApi'

const SEVERITY_STYLE = {
  CRITICAL: { cls: 'bg-red-100 text-red-700 border-red-200',   Icon: AlertCircle },
  WARN:     { cls: 'bg-amber-100 text-amber-700 border-amber-200', Icon: AlertTriangle },
  INFO:     { cls: 'bg-blue-50 text-blue-700 border-blue-200',  Icon: Info },
}

export default function AlertsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useListAlertsQuery({})
  const [acknowledge] = useAcknowledgeAlertMutation()

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">{t('nav.alerts')}</h1>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.data.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-green-700">
          Aucune alerte non acquittée
        </div>
      )}

      <div className="space-y-3">
        {data?.data.map((alert) => {
          const { cls, Icon } = SEVERITY_STYLE[alert.severity as keyof typeof SEVERITY_STYLE] ?? SEVERITY_STYLE.INFO
          return (
            <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-xl border ${cls}`}>
              <Icon size={18} className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold uppercase">{alert.severity}</span>
                  <span className="text-xs opacity-60">{new Date(alert.createdAt).toLocaleString('fr-FR')}</span>
                </div>
                <p className="text-sm">{alert.message}</p>
                <p className="text-xs opacity-60 mt-0.5">{alert.org?.name}</p>
              </div>
              <button onClick={() => acknowledge(alert.id)}
                className="shrink-0 text-xs px-3 py-1 rounded-lg border border-current opacity-60 hover:opacity-100 transition-opacity">
                Acquitter
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
