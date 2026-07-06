import { adminApi } from './apiSlice'

export const adminComplianceApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    listComplianceTemplates: builder.query<any[], void>({
      query: () => '/compliance/templates',
      providesTags: ['Compliance'],
    }),
    getComplianceStats: builder.query<{ totalOrgs: number; totalChecklists: number; itemsByStatus: Record<string, number> }, void>({
      query: () => '/compliance/stats',
      providesTags: ['Compliance'],
    }),
  }),
})

export const { useListComplianceTemplatesQuery, useGetComplianceStatsQuery } = adminComplianceApi
