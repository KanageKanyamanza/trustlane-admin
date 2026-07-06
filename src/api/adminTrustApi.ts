import { adminApi } from './apiSlice'

export interface TrustScoreEntry {
  id: string
  score: number
  reasonCodes: string[]
  createdAt: string
  org: { id: string; name: string }
}

export const adminTrustApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    listTrustScores: builder.query<{ data: TrustScoreEntry[]; total: number }, { page?: number }>({
      query: (params) => ({ url: '/trust-scores', params }),
      providesTags: ['TrustScores'],
    }),
    getTrustHistory: builder.query<TrustScoreEntry[], string>({
      query: (orgId) => `/trust-scores/${orgId}/history`,
    }),
    overrideTrustScore: builder.mutation<void, { orgId: string; score: number; reason: string }>({
      query: ({ orgId, ...body }) => ({ url: `/trust-scores/${orgId}/override`, method: 'POST', body }),
      invalidatesTags: ['TrustScores'],
    }),
    recalculateTrustScore: builder.mutation<void, string>({
      query: (orgId) => ({ url: `/trust-scores/${orgId}/recalculate`, method: 'POST' }),
      invalidatesTags: ['TrustScores'],
    }),
  }),
})

export const {
  useListTrustScoresQuery,
  useGetTrustHistoryQuery,
  useOverrideTrustScoreMutation,
  useRecalculateTrustScoreMutation,
} = adminTrustApi
