import { toast } from 'react-toastify'

import type { IIssuance, IIssuanceDTO, IReturnDTO } from './types/issuance'
import type { IBaseFetchError } from '@/app/types/error'
import { API } from '@/app/api'
import { HttpCodes } from '@/constants/httpCodes'
import { apiSlice } from '@/app/apiSlice'

const issuanceApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getLastIssuance: builder.query<{ data: IIssuance }, string>({
			query: req => ({
				url: `${API.issuance}/last`,
				method: 'GET',
				params: new URLSearchParams({ graphite: req }),
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

		createIssuance: builder.mutation<null, IIssuanceDTO | IReturnDTO>({
			query: data => ({
				url: API.issuance,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [{ type: 'Table', id: 'ALL' }],
		}),

		updateIssuance: builder.mutation<null, IIssuanceDTO>({
			query: data => ({
				url: API.issuance,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [{ type: 'Table', id: 'ALL' }],
		}),

		deleteIssuance: builder.mutation<null, string>({
			query: id => ({
				url: `${API.issuance}/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [{ type: 'Table', id: 'ALL' }],
		}),
	}),
})

export const {
	useGetLastIssuanceQuery,
	useCreateIssuanceMutation,
	useUpdateIssuanceMutation,
	useDeleteIssuanceMutation,
} = issuanceApiSlice
