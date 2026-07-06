import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/admin`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('admin_token')
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: [
    'Admin', 'Orgs', 'Users', 'Documents', 'TrustScores',
    'Compliance', 'AuditLogs', 'Alerts', 'System',
  ],
  endpoints: () => ({}),
})
