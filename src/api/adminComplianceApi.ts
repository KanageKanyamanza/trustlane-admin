import { adminApi } from './apiSlice'

export interface ComplianceTemplate {
  id: string
  market: string
  requirements: string[]
  createdAt: string
}

export interface ChecklistItem {
  id: string
  requirement: string
  status: 'MISSING' | 'IN_REVIEW' | 'PASS' | 'FAIL' | 'NOT_APPLICABLE'
}

export interface Checklist {
  id: string
  market: string
  orgId: string
  createdAt: string
  organization: { id: string; name: string }
  items: ChecklistItem[]
}

export interface ComplianceStats {
  totalOrgs: number
  totalChecklists: number
  itemsByStatus: Record<string, number>
  markets: {
    LOCAL: Record<string, number>
    EU: Record<string, number>
  }
}

export const adminComplianceApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    listComplianceTemplates: builder.query<ComplianceTemplate[], void>({
      query: () => '/compliance/templates',
      providesTags: ['Compliance'],
    }),
    createComplianceTemplate: builder.mutation<ComplianceTemplate, { market: string; requirements: string[] }>({
      query: (body) => ({ url: '/compliance/templates', method: 'POST', body }),
      invalidatesTags: ['Compliance'],
    }),
    updateComplianceTemplate: builder.mutation<ComplianceTemplate, { id: string; market: string; requirements: string[] }>({
      query: ({ id, ...body }) => ({ url: `/compliance/templates/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Compliance'],
    }),
    deleteComplianceTemplate: builder.mutation<void, string>({
      query: (id) => ({ url: `/compliance/templates/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Compliance'],
    }),
    listChecklists: builder.query<Checklist[], void>({
      query: () => '/compliance/checklists',
      providesTags: ['Compliance'],
    }),
    getComplianceStats: builder.query<ComplianceStats, void>({
      query: () => '/compliance/stats',
      providesTags: ['Compliance'],
    }),
  }),
})

export const {
  useListComplianceTemplatesQuery,
  useCreateComplianceTemplateMutation,
  useUpdateComplianceTemplateMutation,
  useDeleteComplianceTemplateMutation,
  useListChecklistsQuery,
  useGetComplianceStatsQuery,
} = adminComplianceApi
