import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useGetOrgQuery } from '../api/adminOrgsApi'

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: org, isLoading } = useGetOrgQuery(id!)

  if (isLoading) return <div className="p-6 text-slate-500">Chargement...</div>
  if (!org) return <div className="p-6 text-slate-500">Organisation introuvable.</div>

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/organizations" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{org.name}</h1>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${org.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {org.isSuspended ? 'Suspendue' : 'Active'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-slate-500 text-xs mb-1">Utilisateurs</p>
          <p className="text-2xl font-bold text-slate-900">{org._count.users}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-slate-500 text-xs mb-1">Documents</p>
          <p className="text-2xl font-bold text-slate-900">{org._count.documents}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-slate-500 text-xs mb-1">Créée le</p>
          <p className="text-lg font-semibold text-slate-900">{new Date(org.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  )
}
