import { adminApi } from './apiSlice'

export const adminAlertsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    listAlerts: builder.query<{ data: any[]; total: number }, { page?: number; severity?: string }>({
      query: (params) => ({ url: '/alerts', params }),
      providesTags: ['Alerts'],
    }),
    acknowledgeAlert: builder.mutation<void, string>({
      query: (id) => ({ url: `/alerts/${id}/acknowledge`, method: 'POST' }),
      invalidatesTags: ['Alerts'],
    }),
  }),
})

export const { useListAlertsQuery, useAcknowledgeAlertMutation } = adminAlertsApi
