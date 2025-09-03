import type { IExtendingDTO } from './types/extending'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'

const extendingApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		createExtending: builder.mutation<null, IExtendingDTO>({
			query: data => ({
				url: API.extending,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [{ type: 'Table', id: 'ALL' }],
		}),

		updateExtending: builder.mutation<null, IExtendingDTO>({
			query: data => ({
				url: API.extending,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [{ type: 'Table', id: 'ALL' }],
		}),

		deleteExtending: builder.mutation<null, string>({
			query: id => ({
				url: `${API.extending}/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [{ type: 'Table', id: 'ALL' }],
		}),
	}),
})

export const { useCreateExtendingMutation, useUpdateExtendingMutation, useDeleteExtendingMutation } = extendingApiSlice
