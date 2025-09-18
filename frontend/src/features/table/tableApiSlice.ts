import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import type {
	IGetTableItemDTO,
	ISetNotesDTO,
	ISetPlaceDTO,
	ISetPurposeDTO,
	ITableItem,
	ITableItemDTO,
} from './types/item'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'
import { buildUrlParams } from './utils/buildUrlParams'

const tableApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getTableItems: builder.query<{ data: ITableItem[]; total: number }, IGetTableItemDTO>({
			query: req => ({
				url: API.table.base,
				method: 'GET',
				params: buildUrlParams(req),
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
		getTableItemById: builder.query<{ data: ITableItem }, string>({
			query: id => ({
				url: `${API.table.base}/${id}`,
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
		getUniqueData: builder.query<{ data: string[] }, { field: string; realm: string }>({
			query: req => ({
				url: `${API.table.unique}/${req.field}`,
				method: 'GET',
				params: new URLSearchParams({ realm: req.realm }),
			}),
			providesTags: [{ type: 'Table', id: 'UNIQUE' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),

		createTableItem: builder.mutation<null, ITableItemDTO>({
			query: data => ({
				url: API.table.base,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [
				{ type: 'Table', id: 'ALL' },
				{ type: 'Table', id: 'UNIQUE' },
			],
		}),
		updateTableItem: builder.mutation<null, ITableItemDTO>({
			query: data => ({
				url: `${API.table.base}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [
				{ type: 'Table', id: 'ALL' },
				{ type: 'Table', id: 'UNIQUE' },
			],
		}),

		setPurpose: builder.mutation<null, ISetPurposeDTO>({
			query: data => ({
				url: API.table.purpose(data.id),
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [
				{ type: 'Table', id: 'ALL' },
				{ type: 'Table', id: 'UNIQUE' },
			],
		}),
		setPlace: builder.mutation<null, ISetPlaceDTO>({
			query: data => ({
				url: API.table.place(data.id),
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [
				{ type: 'Table', id: 'ALL' },
				{ type: 'Table', id: 'UNIQUE' },
			],
		}),
		setNotes: builder.mutation<null, ISetNotesDTO>({
			query: data => ({
				url: API.table.notes(data.id),
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [
				{ type: 'Table', id: 'ALL' },
				{ type: 'Table', id: 'UNIQUE' },
			],
		}),
	}),
})

export const {
	useGetTableItemsQuery,
	useGetTableItemByIdQuery,
	useLazyGetTableItemByIdQuery,
	useGetUniqueDataQuery,
	useLazyGetUniqueDataQuery,
	useCreateTableItemMutation,
	useUpdateTableItemMutation,
	useSetPurposeMutation,
	useSetPlaceMutation,
	useSetNotesMutation,
} = tableApiSlice
