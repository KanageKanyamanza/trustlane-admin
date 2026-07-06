import { adminApi } from './apiSlice'

export const adminSystemApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemHealth: builder.query<any, void>({
      query: () => '/system/health',
      providesTags: ['System'],
    }),
    getRedisStats: builder.query<any, void>({
      query: () => '/system/redis-stats',
      providesTags: ['System'],
    }),
    flushCache: builder.mutation<void, void>({
      query: () => ({ url: '/system/cache/flush', method: 'POST' }),
      invalidatesTags: ['System'],
    }),
  }),
})

export const { useGetSystemHealthQuery, useGetRedisStatsQuery, useFlushCacheMutation } = adminSystemApi
