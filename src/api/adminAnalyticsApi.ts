import { adminApi } from './apiSlice'

export interface GlobalOverview {
  totalOrgs: number
  totalUsers: number
  pendingDocuments: number
  avgTrustScore: number
  criticalAlerts: number
}

export interface RegistrationPoint { month: string; count: number }
export interface DocsByStatus { status: string; count: number }
export interface TrustDistribution { range: string; count: number }

export const adminAnalyticsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query<GlobalOverview, void>({
      query: () => '/analytics/overview',
    }),
    getRegistrations: builder.query<RegistrationPoint[], void>({
      query: () => '/analytics/registrations',
    }),
    getDocsByStatus: builder.query<DocsByStatus[], void>({
      query: () => '/analytics/documents-by-status',
    }),
    getTrustDistribution: builder.query<TrustDistribution[], void>({
      query: () => '/analytics/trust-distribution',
    }),
  }),
})

export const {
  useGetOverviewQuery,
  useGetRegistrationsQuery,
  useGetDocsByStatusQuery,
  useGetTrustDistributionQuery,
} = adminAnalyticsApi
