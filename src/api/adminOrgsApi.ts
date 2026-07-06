import { adminApi } from './apiSlice'

export interface Org {
  id: string
  name: string
  isSuspended: boolean
  createdAt: string
  _count: { users: number; documents: number }
  trustScore?: { score: number } | null
  owner?: { email: string; firstName: string; lastName: string } | null
}

export interface OrgDetail extends Org {
  users: unknown[]
  accounts: unknown[]
  documents: unknown[]
}

export interface PaginatedOrgs {
  data: Org[]
  total: number
  page: number
  pageSize: number
}

export const adminOrgsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    listOrgs: builder.query<PaginatedOrgs, { page?: number; search?: string; suspended?: boolean }>({
      query: (params) => ({ url: '/organizations', params }),
      providesTags: ['Orgs'],
    }),
    getOrg: builder.query<OrgDetail, string>({
      query: (id) => `/organizations/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Orgs', id }],
    }),
    suspendOrg: builder.mutation<void, { id: string; suspend: boolean }>({
      query: ({ id, suspend }) => ({ url: `/organizations/${id}/suspend`, method: 'PATCH', body: { suspend } }),
      invalidatesTags: ['Orgs'],
    }),
    deleteOrg: builder.mutation<void, string>({
      query: (id) => ({ url: `/organizations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Orgs'],
    }),
    getOrgAuditLogs: builder.query<unknown[], string>({
      query: (id) => `/organizations/${id}/audit-logs`,
    }),
  }),
})

export const {
  useListOrgsQuery,
  useGetOrgQuery,
  useSuspendOrgMutation,
  useDeleteOrgMutation,
  useGetOrgAuditLogsQuery,
} = adminOrgsApi
