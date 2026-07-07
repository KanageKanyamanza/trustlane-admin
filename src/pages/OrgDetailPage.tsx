import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldOff, ShieldCheck, Trash2, Users, FileText, Clock, ShieldAlert } from 'lucide-react'
import { useGetOrgQuery, useSuspendOrgMutation, useDeleteOrgMutation, useGetOrgAuditLogsQuery } from '../api/adminOrgsApi'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { admin } = useAdminAuth()
  const { data: org, isLoading } = useGetOrgQuery(id!)
  const { data: auditLogs } = useGetOrgAuditLogsQuery(id!)
  const [suspendOrg, { isLoading: suspending }] = useSuspendOrgMutation()
  const [deleteOrg, { isLoading: deleting }] = useDeleteOrgMutation()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isLoading) return (
    <div className="p-6 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
    </div>
  )
  if (!org) return <div className="p-6 text-slate-500">Organisation introuvable.</div>

  const handleDelete = async () => {
    await deleteOrg(id!)
    navigate('/organizations')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to="/organizations" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{org.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${org.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {org.isSuspended ? 'Suspendue' : 'Active'}
              </span>
              <span className="text-slate-400 text-xs">Créée le {new Date(org.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => suspendOrg({ id: id!, suspend: !org.isSuspended })}
            disabled={suspending}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              org.isSuspended
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            {org.isSuspended ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
            {org.isSuspended ? 'Réactiver' : 'Suspendre'}
          </button>

          {admin?.isSuperAdmin && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} />
              Supprimer
            </button>
          )}
          {admin?.isSuperAdmin && confirmDelete && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">Confirmer ?</span>
              <button onClick={handleDelete} disabled={deleting}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deleting ? '...' : 'Oui, supprimer'}
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 hover:bg-slate-50 transition-colors">
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs', value: org._count.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Documents', value: org._count.documents, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Trust Score', value: org.trustScore ? `${org.trustScore.score}/100` : '—', icon: ShieldAlert, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Créée le', value: new Date(org.createdAt).toLocaleDateString('fr-FR'), icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-xs">{label}</span>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={15} className={color} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Utilisateurs */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Users size={15} className="text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Membres</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {(org.users as any[]).length === 0 && (
              <p className="px-5 py-4 text-slate-400 text-sm">Aucun membre</p>
            )}
            {(org.users as any[]).slice(0, 8).map((u: any) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <FileText size={15} className="text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Documents</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {(org.documents as any[]).length === 0 && (
              <p className="px-5 py-4 text-slate-400 text-sm">Aucun document</p>
            )}
            {(org.documents as any[]).slice(0, 8).map((d: any) => (
              <div key={d.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{d.type}</p>
                  <p className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  d.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                  d.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-sm">Historique des actions</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {!auditLogs || (auditLogs as any[]).length === 0 ? (
            <p className="px-5 py-4 text-slate-400 text-sm">Aucune action enregistrée</p>
          ) : (
            (auditLogs as any[]).slice(0, 10).map((log: any) => (
              <div key={log.id} className="px-5 py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-400">
                    {log.user?.email ?? log.admin?.email ?? 'Système'} · {new Date(log.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{log.entityType}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
