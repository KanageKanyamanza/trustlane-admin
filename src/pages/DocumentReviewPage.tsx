import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle } from 'lucide-react'
import { useListDocumentsQuery, useVerifyDocumentMutation, useRejectDocumentMutation } from '../api/adminDocumentsApi'

export default function DocumentReviewPage() {
  const { t } = useTranslation()
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const { data, isLoading } = useListDocumentsQuery({ status: 'SUBMITTED' })
  const [verify] = useVerifyDocumentMutation()
  const [reject] = useRejectDocumentMutation()

  const handleReject = async () => {
    if (!rejectId || !reason.trim()) return
    await reject({ id: rejectId, reason })
    setRejectId(null)
    setReason('')
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">{t('documents.title')}</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {[t('documents.type'), 'Nom', 'Organisation', 'Date', t('common.actions')].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Chargement...</td></tr>}
            {!isLoading && data?.data.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Aucun document en attente</td></tr>
            )}
            {data?.data.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">{doc.type}</span></td>
                <td className="px-4 py-3 font-medium text-slate-900">{doc.name}</td>
                <td className="px-4 py-3 text-slate-600">{doc.org.name}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => verify(doc.id)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-medium transition-colors">
                      <CheckCircle size={13} /> {t('documents.verify')}
                    </button>
                    <button onClick={() => setRejectId(doc.id)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors">
                      <XCircle size={13} /> {t('documents.reject')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-slate-900">{t('documents.reject')}</h3>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder={t('documents.reason')}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRejectId(null)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">{t('common.cancel')}</button>
              <button onClick={handleReject} disabled={!reason.trim()}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">{t('documents.reject')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
