import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Eye, ExternalLink, X } from 'lucide-react'
import { useListDocumentsQuery, useVerifyDocumentMutation, useRejectDocumentMutation, type AdminDocument } from '../api/adminDocumentsApi'

export default function DocumentReviewPage() {
  const { t } = useTranslation()
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<AdminDocument | null>(null)
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
                    <button onClick={() => setPreviewDoc(doc)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors"
                      title="Prévisualiser le document">
                      <Eye size={13} /> {t('common.preview') || 'Visualiser'}
                    </button>
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

    {/* Preview modal */}
    {previewDoc && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{previewDoc.name}</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Organisation: <span className="font-medium text-slate-700">{previewDoc.org.name}</span> · Type: <span className="font-mono bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px]">{previewDoc.type}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/api/admin/documents/${previewDoc.id}/download?download=true`}
                download
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium px-3 py-2 rounded-lg border border-slate-200 transition-colors bg-white shadow-sm"
              >
                <ExternalLink size={14} />
                Télécharger
              </a>
              <button onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body (Preview content) */}
          <div className="flex-1 bg-slate-100 p-6 overflow-hidden flex items-center justify-center">
            {(() => {
              const fileName = previewDoc.versions?.[0]?.fileName || previewDoc.name || ''
              const isImage = /\.(png|jpe?g|gif|webp)$/i.test(fileName)
              const isPdf = /\.pdf$/i.test(fileName)

              const src = `/api/admin/documents/${previewDoc.id}/download`

              if (isPdf) {
                return (
                  <iframe
                    src={src}
                    className="w-full h-full rounded-lg border border-slate-200 shadow-inner bg-white"
                    title={previewDoc.name}
                  />
                )
              } else if (isImage) {
                return (
                  <div className="w-full h-full flex items-center justify-center overflow-auto">
                    <img
                      src={src}
                      alt={previewDoc.name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-md bg-white"
                    />
                  </div>
                )
              } else {
                return (
                  <div className="text-center p-8 bg-white rounded-2xl shadow border max-w-sm">
                    <p className="text-slate-600 text-sm font-medium mb-3">La prévisualisation de ce type de fichier n'est pas supportée dans le navigateur.</p>
                    <a
                      href={`${src}?download=true`}
                      download
                      className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                    >
                      Télécharger pour l'ouvrir
                    </a>
                  </div>
                )
              }
            })()}
          </div>

          {/* Modal Footer (Quick actions) */}
          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 shrink-0">
            <button
              onClick={() => {
                verify(previewDoc.id)
                setPreviewDoc(null)
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <CheckCircle size={15} /> Valider
            </button>
            <button
              onClick={() => {
                setRejectId(previewDoc.id)
                setPreviewDoc(null)
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <XCircle size={15} /> Rejeter
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}
