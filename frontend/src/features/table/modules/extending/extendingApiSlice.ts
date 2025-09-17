import { toast } from 'react-toastify'

import type { IExtendingDTO } from './types/extending'
import type { IBaseFetchError } from '@/app/types/error'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import { HttpCodes } from '@/constants/httpCodes'

const extendingApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getExtending: builder.query<{ data: IExtendingDTO[]; total: number }, string>({
			query: graphite => ({
				url: API.extending,
				method: 'GET',
				params: new URLSearchParams({ graphite }),
			}),
			providesTags: [{ type: 'Table', id: 'ALL' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					if (fetchError.status == HttpCodes.NOT_FOUND) return
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

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
				url: `${API.extending}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [{ type: 'Table', id: 'ALL' }],
		}),

		deleteExtending: builder.mutation<null, { id: string; realm: string; graphite: string }>({
			query: data => ({
				url: `${API.extending}/${data.id}`,
				method: 'DELETE',
				params: new URLSearchParams({ realm: data.realm, graphite: data.graphite }),
			}),
			invalidatesTags: [{ type: 'Table', id: 'ALL' }],
		}),
	}),
})

export const {
	useGetExtendingQuery,
	useCreateExtendingMutation,
	useUpdateExtendingMutation,
	useDeleteExtendingMutation,
} = extendingApiSlice
