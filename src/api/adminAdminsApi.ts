import { adminApi } from './apiSlice'

export const adminAdminsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    listAdmins: builder.query<any[], void>({
      query: () => '/admins',
      providesTags: ['Admin'],
    }),
    createAdmin: builder.mutation<any, { email: string; firstName: string; lastName: string; password: string; isSuperAdmin: boolean }>({
      query: (body) => ({ url: '/admins', method: 'POST', body }),
      invalidatesTags: ['Admin'],
    }),
    deleteAdmin: builder.mutation<void, string>({
      query: (id) => ({ url: `/admins/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin'],
    }),
  }),
})

export const { useListAdminsQuery, useCreateAdminMutation, useDeleteAdminMutation } = adminAdminsApi
