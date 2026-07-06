import { adminApi } from './apiSlice'

export interface AdminDocument {
  id: string
  type: string
  name: string
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'
  createdAt: string
  org: { id: string; name: string }
  versions: { id: string; fileUrl: string; fileName: string; createdAt: string }[]
}

export const adminDocumentsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    listDocuments: builder.query<{ data: AdminDocument[]; total: number }, { page?: number; status?: string; orgId?: string; type?: string }>({
      query: (params) => ({ url: '/documents', params }),
      providesTags: ['Documents'],
    }),
    getDocument: builder.query<AdminDocument, string>({
      query: (id) => `/documents/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Documents', id }],
    }),
    verifyDocument: builder.mutation<void, string>({
      query: (id) => ({ url: `/documents/${id}/verify`, method: 'PATCH' }),
      invalidatesTags: ['Documents'],
    }),
    rejectDocument: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/documents/${id}/reject`, method: 'PATCH', body: { reason } }),
      invalidatesTags: ['Documents'],
    }),
  }),
})

export const {
  useListDocumentsQuery,
  useGetDocumentQuery,
  useVerifyDocumentMutation,
  useRejectDocumentMutation,
} = adminDocumentsApi
