import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ListTodo,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  X,
  FileSpreadsheet,
  BarChart3,
  Edit2
} from 'lucide-react'
import {
  useListComplianceTemplatesQuery,
  useGetComplianceStatsQuery,
  useUpdateComplianceTemplateMutation,
  useListChecklistsQuery,
  type ComplianceTemplate
} from '../api/adminComplianceApi'

type Tab = 'templates' | 'checklists' | 'stats'

export default function CompliancePage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('templates')
  const { data: templates, isLoading: templatesLoading } = useListComplianceTemplatesQuery()
  const { data: checklists, isLoading: checklistsLoading } = useListChecklistsQuery()
  const { data: stats, isLoading: statsLoading } = useGetComplianceStatsQuery()
  const [updateTemplate] = useUpdateComplianceTemplateMutation()

  // Editing templates state
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [editRequirements, setEditRequirements] = useState<string[]>([])
  const [newRequirement, setNewRequirement] = useState('')

  const startEdit = (tpl: ComplianceTemplate) => {
    setEditingTemplateId(tpl.id)
    setEditRequirements([...tpl.requirements])
  }

  const cancelEdit = () => {
    setEditingTemplateId(null)
    setNewRequirement('')
  }

  const addRequirement = () => {
    if (!newRequirement.trim()) return
    setEditRequirements([...editRequirements, newRequirement.trim()])
    setNewRequirement('')
  }

  const removeRequirement = (index: number) => {
    setEditRequirements(editRequirements.filter((_, i) => i !== index))
  }

  const saveRequirements = async (tpl: ComplianceTemplate) => {
    await updateTemplate({
      id: tpl.id,
      market: tpl.market,
      requirements: editRequirements
    })
    setEditingTemplateId(null)
  }

  // Calculate market compliance progress
  const getProgress = (marketStats?: Record<string, number>) => {
    if (!marketStats) return 0
    const pass = marketStats.PASS ?? 0
    const total = (marketStats.PASS ?? 0) + (marketStats.FAIL ?? 0) + (marketStats.IN_REVIEW ?? 0) + (marketStats.MISSING ?? 0)
    return total > 0 ? Math.round((pass / total) * 100) : 0
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('nav.compliance')}</h1>
        <p className="text-slate-500 text-sm mt-1">Gérer les requis de conformité et suivre le statut par marché</p>
      </div>

      {/* Navigation Onglets */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'templates'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ListTodo size={16} />
          Templates de conformité
        </button>
        <button
          onClick={() => setActiveTab('checklists')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'checklists'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileSpreadsheet size={16} />
          Checklists par organisation
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'stats'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 size={16} />
          Statistiques de conformité
        </button>
      </div>

      {/* CONTENU ONGLET TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse h-60" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates?.map((tpl) => {
                const isEditing = editingTemplateId === tpl.id
                return (
                  <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{tpl.market} Market</h3>
                          <p className="text-slate-400 text-xs mt-0.5">Mis à jour le {new Date(tpl.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        {!isEditing && (
                          <button
                            onClick={() => startEdit(tpl)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                          >
                            <Edit2 size={13} />
                            Modifier
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                            {editRequirements.map((req, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm">
                                <span className="text-slate-700 break-all">{req}</span>
                                <button
                                  type="button"
                                  onClick={() => removeRequirement(idx)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newRequirement}
                              onChange={(e) => setNewRequirement(e.target.value)}
                              placeholder="Ajouter une exigence..."
                              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  addRequirement()
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={addRequirement}
                              className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 rounded-lg text-sm"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {tpl.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          <X size={13} />
                          Annuler
                        </button>
                        <button
                          onClick={() => saveRequirements(tpl)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold"
                        >
                          <Save size={13} />
                          Enregistrer
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENU ONGLET CHECKLISTS */}
      {activeTab === 'checklists' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Organisation', 'Marché', 'Créée le', 'Statut des exigences', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checklistsLoading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">Chargement des checklists...</td>
                </tr>
              )}
              {!checklistsLoading && checklists?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucune checklist de conformité n'a été créée pour le moment.</td>
                </tr>
              )}
              {checklists?.map((cl) => {
                const passCount = cl.items.filter(i => i.status === 'PASS').length
                const inReviewCount = cl.items.filter(i => i.status === 'IN_REVIEW').length
                const failCount = cl.items.filter(i => i.status === 'FAIL').length
                const missingCount = cl.items.filter(i => i.status === 'MISSING').length
                const totalCount = cl.items.length

                return (
                  <tr key={cl.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">{cl.organization.name}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        cl.market === 'EU' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {cl.market}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{new Date(cl.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2 text-xs font-medium">
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg">
                          <CheckCircle2 size={12} /> {passCount} Conformes
                        </span>
                        {inReviewCount > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg">
                            <Clock size={12} /> {inReviewCount} En révision
                          </span>
                        )}
                        {failCount > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-lg">
                            <XCircle size={12} /> {failCount} Non conformes
                          </span>
                        )}
                        {missingCount > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
                            <AlertCircle size={12} /> {missingCount} Manquants
                          </span>
                        )}
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                          Total: {totalCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`/organizations/${cl.orgId}`}
                        className="text-xs text-brand-600 hover:text-brand-800 font-semibold hover:underline"
                      >
                        Consulter l'organisation
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTENU ONGLET STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse h-40" />
              ))}
            </div>
          ) : (
            <>
              {/* Cards des volumes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Organisations suivies</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalOrgs}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Checklists actives</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalChecklists}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total exigences révisées</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-2">
                    {stats?.itemsByStatus
                      ? Object.values(stats.itemsByStatus).reduce((a, b) => a + b, 0)
                      : '0'}
                  </p>
                </div>
              </div>

              {/* Progress bars par marché */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <h3 className="font-bold text-slate-900 text-base">Progrès de conformité globale par marché</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* LOCAL */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-700">Marché LOCAL</span>
                      <span className="text-blue-600">{getProgress(stats?.markets?.LOCAL)}% Conforme</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${getProgress(stats?.markets?.LOCAL)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{stats?.markets?.LOCAL?.PASS ?? 0} exigences conformes</span>
                      <span>Total: {
                        stats?.markets?.LOCAL
                          ? Object.values(stats.markets.LOCAL).reduce((a, b) => a + b, 0)
                          : 0
                      }</span>
                    </div>
                  </div>

                  {/* EU */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-700">Marché EU</span>
                      <span className="text-purple-600">{getProgress(stats?.markets?.EU)}% Conforme</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${getProgress(stats?.markets?.EU)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{stats?.markets?.EU?.PASS ?? 0} exigences conformes</span>
                      <span>Total: {
                        stats?.markets?.EU
                          ? Object.values(stats.markets.EU).reduce((a, b) => a + b, 0)
                          : 0
                      }</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status items breakdown */}
              {stats?.itemsByStatus && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 text-base mb-4">Répartition globale des exigences de conformité</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                      <p className="text-green-800 font-semibold text-lg">{stats.itemsByStatus.PASS ?? 0}</p>
                      <p className="text-green-600 text-xs font-medium mt-1">Validées (Conformes)</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                      <p className="text-yellow-800 font-semibold text-lg">{stats.itemsByStatus.IN_REVIEW ?? 0}</p>
                      <p className="text-yellow-600 text-xs font-medium mt-1">En révision</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                      <p className="text-red-800 font-semibold text-lg">{stats.itemsByStatus.FAIL ?? 0}</p>
                      <p className="text-red-600 text-xs font-medium mt-1">Rejetées (Non conformes)</p>
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center">
                      <p className="text-slate-800 font-semibold text-lg">{stats.itemsByStatus.MISSING ?? 0}</p>
                      <p className="text-slate-600 text-xs font-medium mt-1">Manquantes</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
