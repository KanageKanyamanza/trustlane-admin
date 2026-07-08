import { useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, Shield, ShieldCheck, X } from 'lucide-react'
import { useListAdminsQuery, useCreateAdminMutation, useDeleteAdminMutation } from '../api/adminAdminsApi'
import { useAdminAuth } from '../context/AdminAuthContext'

const EMPTY_FORM = { email: '', firstName: '', lastName: '', password: '', isSuperAdmin: false }

export default function AdminsPage() {
  const { admin: me } = useAdminAuth()
  const { data, isLoading } = useListAdminsQuery()
  const [createAdmin, { isLoading: creating }] = useCreateAdminMutation()
  const [deleteAdmin] = useDeleteAdminMutation()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!me?.isSuperAdmin) {
    return <div className="p-6 text-slate-500">Accès réservé aux Super Admins.</div>
  }

  const handleCreate = async () => {
    setError(null)
    if (!form.email || !form.firstName || !form.lastName || !form.password) {
      setError('Tous les champs sont requis.')
      return
    }
    try {
      await createAdmin(form).unwrap()
      setShowForm(false)
      setForm(EMPTY_FORM)
    } catch (e: any) {
      setError(e?.data?.error ?? 'Erreur lors de la création.')
    }
  }

  const handleDelete = async (id: string) => {
    await deleteAdmin(id)
    setConfirmDeleteId(null)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administrateurs</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data?.length ?? 0} admin{(data?.length ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
        >
          <Plus size={15} /> Nouvel admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Nom', 'Email', 'Rôle', 'Créé le', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            )}
            {data?.map((a: any) => (
              <tr key={a.id} className={`hover:bg-slate-50 transition-colors ${a.id === me.id ? 'bg-brand-50/40' : ''}`}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {a.firstName} {a.lastName}
                  {a.id === me.id && <span className="ml-2 text-xs text-brand-500 font-normal">(vous)</span>}
                </td>
                <td className="px-4 py-3 text-slate-600">{a.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${a.isSuperAdmin ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {a.isSuperAdmin ? <ShieldCheck size={11} /> : <Shield size={11} />}
                    {a.isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  {a.id !== me.id && (
                    confirmDeleteId === a.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600">Confirmer ?</span>
                        <button onClick={() => handleDelete(a.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Oui</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 border rounded-lg hover:bg-slate-50 transition-colors">Non</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(a.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Créer un administrateur</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Prénom</label>
                <input type="text" value={form.firstName}
                  onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Nom</label>
                <input type="text" value={form.lastName}
                  onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.isSuperAdmin}
                onChange={(e) => setForm(f => ({ ...f, isSuperAdmin: e.target.checked }))}
                className="rounded w-4 h-4 accent-brand-500" />
              <div>
                <span className="text-sm font-medium text-slate-900">Super Admin</span>
                <p className="text-xs text-slate-500">Accès complet incluant la gestion des admins</p>
              </div>
            </label>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleCreate} disabled={creating}
                className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors">
                {creating ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
