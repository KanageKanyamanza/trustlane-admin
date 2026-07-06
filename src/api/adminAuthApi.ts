import { adminApi } from './apiSlice'

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  isSuperAdmin: boolean
}

export interface LoginRequest { email: string; password: string }
export interface LoginResponse { accessToken: string; refreshToken: string; admin: AdminUser }

export const adminAuthApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    adminRefresh: builder.mutation<{ accessToken: string }, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),
    adminMe: builder.query<AdminUser, void>({
      query: () => '/auth/me',
      providesTags: ['Admin'],
    }),
    adminLogout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
})

export const {
  useAdminLoginMutation,
  useAdminRefreshMutation,
  useAdminMeQuery,
  useAdminLogoutMutation,
} = adminAuthApi
