import { useTranslation } from 'react-i18next'
import { useGetSystemHealthQuery, useGetRedisStatsQuery, useFlushCacheMutation } from '../api/adminSystemApi'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function SystemPage() {
  const { t } = useTranslation()
  const { admin } = useAdminAuth()
  const { data: health } = useGetSystemHealthQuery(undefined, { pollingInterval: 30000 })
  const { data: redis } = useGetRedisStatsQuery(undefined, { pollingInterval: 30000 })
  const [flushCache, { isLoading: isFlushing }] = useFlushCacheMutation()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t('system.title')}</h1>

      {/* Health */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">{t('system.health')}</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Backend', ok: health?.status === 'OK' },
            { label: 'Database', ok: health?.db === 'OK' },
            { label: 'Redis', ok: health?.redis === 'OK' },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2">
              {ok ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
              <span className="text-sm text-slate-700">{label}</span>
              <span className={`ml-auto text-xs font-medium ${ok ? 'text-green-600' : 'text-red-500'}`}>{ok ? 'OK' : 'KO'}</span>
            </div>
          ))}
        </div>
        {health?.uptime && <p className="text-xs text-slate-400 mt-3">Uptime : {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</p>}
      </div>

      {/* Redis */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">{t('system.redis')}</h2>
          {admin?.isSuperAdmin && (
            <button onClick={() => flushCache()} disabled={isFlushing}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
              <RefreshCw size={12} className={isFlushing ? 'animate-spin' : ''} />
              {t('system.flushCache')}
            </button>
          )}
        </div>
        {redis && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-slate-500 text-xs">Mémoire utilisée</p><p className="font-semibold text-slate-900">{redis.usedMemory}</p></div>
            <div><p className="text-slate-500 text-xs">Clés totales</p><p className="font-semibold text-slate-900">{redis.totalKeys}</p></div>
            <div><p className="text-slate-500 text-xs">Clients connectés</p><p className="font-semibold text-slate-900">{redis.connectedClients}</p></div>
          </div>
        )}
      </div>
    </div>
  )
}
