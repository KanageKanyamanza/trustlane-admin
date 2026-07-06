import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { useListAdminsQuery, useCreateAdminMutation, useDeleteAdminMutation } from '../api/adminAdminsApi'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminsPage() {
  const { t } = useTranslation()
  const { admin: me } = useAdminAuth()
  const { data, isLoading } = useListAdminsQuery()
  const [createAdmin] = useCreateAdminMutation()
  const [deleteAdmin] = useDeleteAdminMutation()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '', isSuperAdmin: false })
  const [showPassword, setShowPassword] = useState(false)

  if (!me?.isSuperAdmin) {
    return <div className="p-6 text-slate-500">Accès réservé aux Super Admins.</div>
  }

  const handleCreate = async () => {
    await createAdmin(form)
    setShowForm(false)
    setForm({ email: '', firstName: '', lastName: '', password: '', isSuperAdmin: false })
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('nav.admins')}</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">
          <Plus size={15} /> Nouvel admin
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Nom', 'Email', 'Rôle', t('common.createdAt'), ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Chargement...</td></tr>}
            {data?.map((a: { id: string; firstName: string; lastName: string; email: string; isSuperAdmin: boolean; createdAt: string }) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{a.firstName} {a.lastName}</td>
                <td className="px-4 py-3 text-slate-600">{a.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.isSuperAdmin ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {a.isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  {a.id !== me.id && (
                    <button onClick={() => deleteAdmin(a.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-slate-900">Créer un admin</h3>
            {(['firstName', 'lastName', 'email'] as const).map((field) => (
              <input key={field} type="text"
                placeholder={field} value={form[field]}
                onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            ))}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="password"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.isSuperAdmin}
                onChange={(e) => setForm(f => ({ ...f, isSuperAdmin: e.target.checked }))}
                className="rounded" />
              Super Admin
            </label>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">{t('common.cancel')}</button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600">{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
