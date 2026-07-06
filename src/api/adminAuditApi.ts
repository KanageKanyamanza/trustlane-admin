import { adminApi } from './apiSlice'

export interface AuditLogEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  oldData: unknown
  newData: unknown
  createdAt: string
  user?: { email: string; firstName: string; lastName: string } | null
  admin?: { email: string } | null
  org?: { name: string } | null
}

export const adminAuditApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    listAuditLogs: builder.query<{ data: AuditLogEntry[]; total: number }, { page?: number; orgId?: string; userId?: string; action?: string; entityType?: string; from?: string; to?: string }>({
      query: (params) => ({ url: '/audit-logs', params }),
      providesTags: ['AuditLogs'],
    }),
  }),
})

export const { useListAuditLogsQuery } = adminAuditApi
