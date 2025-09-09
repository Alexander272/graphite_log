import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'

const importApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		importFile: builder.mutation<{ message: string }, { file: File; realm: string }>({
			queryFn: async (dto, _api, _, baseQuery) => {
				const data = new FormData()
				data.append('realm', dto.realm)
				data.append('files', dto.file)

				const result = await baseQuery({
					url: API.import,
					cache: 'no-cache',
					method: 'POST',
					body: data,
				})

				if (result.error) {
					console.log(result.error)
					const fetchError = result.error as IFetchError
					toast.error(fetchError.data.message, { autoClose: false })
				}

				return { data: result.data as { message: string } }
			},
		}),
	}),
})

export const { useImportFileMutation } = importApiSlice
