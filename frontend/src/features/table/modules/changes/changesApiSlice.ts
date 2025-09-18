import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import type { IChange } from './types/changes'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'

const changesApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getChanges: builder.query<{ data: IChange[]; total: number }, { graphite: string; section: string }>({
			query: data => ({
				url: `${API.changes}/${data.graphite}/${data.section}`,
				method: 'GET',
			}),
			providesTags: [{ type: 'Table', id: 'ALL' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),
	}),
})

export const { useGetChangesQuery } = changesApiSlice
