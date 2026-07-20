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

export interface Account {
  id: string
  name: string
  type: string
  currency: string
  balance: number
}

export interface BeneficialOwner {
  id: string
  name: string
  role: string | null
  ownershipPct: number | null
  nationality: string | null
  email: string | null
  phone: string | null
}

export interface SmeProfile {
  id: string
  legalName: string
  registrationNo: string | null
  taxId: string | null
  country: string | null
  address: string | null
  industry: string | null
  employeeCount: number | null
  annualTurnover: string | null
  currency: string
  beneficialOwners: BeneficialOwner[]
}

export interface ConsentGrant {
  id: string
  partnerName: string
  purpose: string
  scope: string
  expiresAt: string
  createdAt: string
}

export interface Budget {
  id: string
  category: string
  amount: string
  period: string
}

export interface RecurringRule {
  id: string
  name: string
  amount: string
  direction: 'IN' | 'OUT'
  frequency: string
  startDate: string
  endDate: string | null
}

export interface OrgDetail extends Org {
  users: unknown[]
  accounts: Account[]
  documents: unknown[]
  smeProfile: SmeProfile | null
  consentGrants: ConsentGrant[]
  publicProfile: { slug: string; isActive: boolean } | null
  budget: Budget[]
  recurringRules: RecurringRule[]
  _count: { users: number; documents: number; transactions: number; alerts: number }
}

export interface Transaction {
  id: string
  occurredAt: string
  direction: 'IN' | 'OUT'
  amount: string
  currency: string
  method: string
  category: string
  counterparty: string | null
  notes: string | null
  account: { id: string; name: string }
}

export interface PaginatedOrgs {
  data: Org[]
  total: number
  page: number
  pageSize: number
}

export interface PaginatedTransactions {
  data: Transaction[]
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
    getOrgTransactions: builder.query<PaginatedTransactions, { id: string; page?: number; direction?: string; category?: string }>({
      query: ({ id, ...params }) => ({ url: `/organizations/${id}/transactions`, params }),
    }),
  }),
})

export const {
  useListOrgsQuery,
  useGetOrgQuery,
  useSuspendOrgMutation,
  useDeleteOrgMutation,
  useGetOrgAuditLogsQuery,
  useGetOrgTransactionsQuery,
} = adminOrgsApi
