import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ShieldOff, ShieldCheck, Trash2, Users, FileText, Clock, ShieldAlert,
  Wallet, ArrowDownCircle, ArrowUpCircle, Building2, HandCoins, Repeat, ListTree,
} from 'lucide-react'
import {
  useGetOrgQuery, useSuspendOrgMutation, useDeleteOrgMutation, useGetOrgAuditLogsQuery,
  useGetOrgTransactionsQuery,
} from '../api/adminOrgsApi'
import { useAdminAuth } from '../context/AdminAuthContext'

function formatMoney(amount: number | string, currency: string) {
  const value = typeof amount === 'string' ? Number(amount) : amount
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
}

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { admin } = useAdminAuth()
  const { data: org, isLoading } = useGetOrgQuery(id!)
  const { data: auditLogs } = useGetOrgAuditLogsQuery(id!)
  const [suspendOrg, { isLoading: suspending }] = useSuspendOrgMutation()
  const [deleteOrg, { isLoading: deleting }] = useDeleteOrgMutation()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [txnPage, setTxnPage] = useState(1)
  const { data: txns, isLoading: txnsLoading } = useGetOrgTransactionsQuery({ id: id!, page: txnPage })

  if (isLoading) return (
    <div className="p-6 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
    </div>
  )
  if (!org) return <div className="p-6 text-slate-500">Organisation introuvable.</div>

  const handleDelete = async () => {
    setDeleteError('')
    try {
      await deleteOrg(id!).unwrap()
      navigate('/organizations')
    } catch {
      setDeleteError("Échec de la suppression. Réessayez ou contactez le support si le problème persiste.")
    }
  }

  const totalBalance = org.accounts.reduce((sum, a) => sum + Number(a.balance), 0)
  const mainCurrency = org.accounts[0]?.currency ?? 'XAF'

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

      {deleteError && (
        <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {deleteError}
        </p>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: 'Solde total', value: formatMoney(totalBalance, mainCurrency), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
            <p className="text-xl font-bold text-slate-900 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Comptes */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Wallet size={15} className="text-slate-400" />
          <h2 className="font-semibold text-slate-900 text-sm">Comptes</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {org.accounts.length === 0 && (
            <p className="px-5 py-4 text-slate-400 text-sm">Aucun compte</p>
          )}
          {org.accounts.map((a) => (
            <div key={a.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{a.name}</p>
                <p className="text-xs text-slate-400">{a.type}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900">{formatMoney(a.balance, a.currency)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTree size={15} className="text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Transactions</h2>
          </div>
          <span className="text-slate-400 text-xs">{org._count.transactions} au total</span>
        </div>
        <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
          {txnsLoading && <p className="px-5 py-4 text-slate-400 text-sm">Chargement...</p>}
          {!txnsLoading && txns?.data.length === 0 && (
            <p className="px-5 py-4 text-slate-400 text-sm">Aucune transaction</p>
          )}
          {txns?.data.map((t) => (
            <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {t.direction === 'IN'
                  ? <ArrowDownCircle size={16} className="text-green-500 shrink-0" />
                  : <ArrowUpCircle size={16} className="text-red-500 shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{t.counterparty || t.category}</p>
                  <p className="text-xs text-slate-400">
                    {t.account.name} · {new Date(t.occurredAt).toLocaleDateString('fr-FR')} · {t.category}
                  </p>
                </div>
              </div>
              <p className={`text-sm font-semibold shrink-0 ${t.direction === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                {t.direction === 'IN' ? '+' : '-'}{formatMoney(t.amount, t.currency)}
              </p>
            </div>
          ))}
        </div>
        {txns && txns.total > txns.pageSize && (
          <div className="flex justify-center gap-2 py-3 border-t border-slate-100">
            <button onClick={() => setTxnPage((p) => Math.max(1, p - 1))} disabled={txnPage === 1}
              className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-slate-50">Précédent</button>
            <span className="px-3 py-1 text-xs text-slate-500">Page {txnPage}</span>
            <button onClick={() => setTxnPage((p) => p + 1)} disabled={(txns.data.length) < txns.pageSize}
              className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-slate-50">Suivant</button>
          </div>
        )}
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

      {/* Profil SME + Bénéficiaires effectifs */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Building2 size={15} className="text-slate-400" />
          <h2 className="font-semibold text-slate-900 text-sm">Profil entreprise (KYC)</h2>
        </div>
        {!org.smeProfile ? (
          <p className="px-5 py-4 text-slate-400 text-sm">Aucun profil renseigné</p>
        ) : (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-slate-400 text-xs mb-0.5">Raison sociale</p><p className="text-slate-900 font-medium">{org.smeProfile.legalName}</p></div>
              <div><p className="text-slate-400 text-xs mb-0.5">RCCM</p><p className="text-slate-900 font-medium">{org.smeProfile.registrationNo ?? '—'}</p></div>
              <div><p className="text-slate-400 text-xs mb-0.5">NIU / Tax ID</p><p className="text-slate-900 font-medium">{org.smeProfile.taxId ?? '—'}</p></div>
              <div><p className="text-slate-400 text-xs mb-0.5">Secteur</p><p className="text-slate-900 font-medium">{org.smeProfile.industry ?? '—'}</p></div>
              <div><p className="text-slate-400 text-xs mb-0.5">Pays</p><p className="text-slate-900 font-medium">{org.smeProfile.country ?? '—'}</p></div>
              <div><p className="text-slate-400 text-xs mb-0.5">Adresse</p><p className="text-slate-900 font-medium">{org.smeProfile.address ?? '—'}</p></div>
              <div><p className="text-slate-400 text-xs mb-0.5">Effectif</p><p className="text-slate-900 font-medium">{org.smeProfile.employeeCount ?? '—'}</p></div>
              <div><p className="text-slate-400 text-xs mb-0.5">CA annuel</p><p className="text-slate-900 font-medium">{org.smeProfile.annualTurnover ? formatMoney(org.smeProfile.annualTurnover, org.smeProfile.currency) : '—'}</p></div>
            </div>

            {org.smeProfile.beneficialOwners.length > 0 && (
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Bénéficiaires effectifs</p>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
                  {org.smeProfile.beneficialOwners.map((bo) => (
                    <div key={bo.id} className="px-3 py-2 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{bo.name}</p>
                        <p className="text-xs text-slate-400">{bo.role ?? '—'} · {bo.nationality ?? '—'}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{bo.ownershipPct != null ? `${bo.ownershipPct}%` : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Consentements */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <HandCoins size={15} className="text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Consentements partenaires</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {org.consentGrants.length === 0 && <p className="px-5 py-4 text-slate-400 text-sm">Aucun</p>}
            {org.consentGrants.map((cg) => (
              <div key={cg.id} className="px-5 py-3">
                <p className="text-sm font-medium text-slate-900">{cg.partnerName}</p>
                <p className="text-xs text-slate-400">{cg.purpose} · expire le {new Date(cg.expiresAt).toLocaleDateString('fr-FR')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Budgets */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Wallet size={15} className="text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Budgets</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {org.budget.length === 0 && <p className="px-5 py-4 text-slate-400 text-sm">Aucun</p>}
            {org.budget.map((b) => (
              <div key={b.id} className="px-5 py-3 flex items-center justify-between">
                <p className="text-sm text-slate-900">{b.category}</p>
                <p className="text-sm font-semibold text-slate-700">{formatMoney(b.amount, mainCurrency)}<span className="text-slate-400 font-normal">/{b.period.toLowerCase()}</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* Règles récurrentes */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Repeat size={15} className="text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Règles récurrentes</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {org.recurringRules.length === 0 && <p className="px-5 py-4 text-slate-400 text-sm">Aucune</p>}
            {org.recurringRules.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.frequency}</p>
                </div>
                <p className={`text-sm font-semibold ${r.direction === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                  {r.direction === 'IN' ? '+' : '-'}{formatMoney(r.amount, mainCurrency)}
                </p>
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
