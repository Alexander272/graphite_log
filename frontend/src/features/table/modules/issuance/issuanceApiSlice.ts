import { toast } from 'react-toastify'

import type { IIssuance, IIssuanceDTO, IReturnDTO } from './types/issuance'
import type { IBaseFetchError } from '@/app/types/error'
import { API } from '@/app/api'
import { HttpCodes } from '@/constants/httpCodes'
import { apiSlice } from '@/app/apiSlice'

const issuanceApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getIssuance: builder.query<{ data: IIssuance[]; total: number }, string>({
			query: graphite => ({
				url: API.issuance,
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
				url: `${API.issuance}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [{ type: 'Table', id: 'ALL' }],
		}),

		deleteIssuance: builder.mutation<null, { id: string; graphite: string }>({
			query: dto => ({
				url: `${API.issuance}/${dto.id}`,
				method: 'DELETE',
				params: new URLSearchParams({ graphite: dto.graphite }),
			}),
			invalidatesTags: [{ type: 'Table', id: 'ALL' }],
		}),
	}),
})

export const {
	useGetIssuanceQuery,
	useGetLastIssuanceQuery,
	useCreateIssuanceMutation,
	useUpdateIssuanceMutation,
	useDeleteIssuanceMutation,
} = issuanceApiSlice
