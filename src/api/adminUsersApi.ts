import { adminApi } from './apiSlice'

export interface AdminUserEntry {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isBlocked: boolean
  createdAt: string
  org: { id: string; name: string }
}

export const adminUsersApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<{ data: AdminUserEntry[]; total: number }, { page?: number; role?: string; orgId?: string; search?: string }>({
      query: (params) => ({ url: '/users', params }),
      providesTags: ['Users'],
    }),
    getUser: builder.query<AdminUserEntry, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Users', id }],
    }),
    updateUser: builder.mutation<void, { id: string; role?: string; isBlocked?: boolean }>({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Users'],
    }),
    resetUserPassword: builder.mutation<{ tempPassword: string }, string>({
      query: (id) => ({ url: `/users/${id}/reset-password`, method: 'POST' }),
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),
  }),
})

export const {
  useListUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
} = adminUsersApi
