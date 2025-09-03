import type { IIssuanceDTO } from './types/issuance'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'

const issuanceApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		createIssuance: builder.mutation<null, IIssuanceDTO>({
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

export const { useCreateIssuanceMutation, useUpdateIssuanceMutation, useDeleteIssuanceMutation } = issuanceApiSlice
