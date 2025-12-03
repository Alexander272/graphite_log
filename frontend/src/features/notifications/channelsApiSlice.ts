import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import type { IChannel, IChannelDTO } from './types/channels'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'

export const channelsApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getChannels: builder.query<{ data: IChannel[] }, string | null>({
			query: type => ({
				url: API.channels,
				method: 'GET',
				params: type ? { type } : {},
			}),
			providesTags: [{ type: 'Notifications', id: 'Channels' }],
			onQueryStarted: async (_arg, api) => {
				try {
					await api.queryFulfilled
				} catch (error) {
					console.log(error)
					const fetchError = (error as IBaseFetchError).error
					toast.error(fetchError.data.message, { autoClose: false })
				}
			},
		}),
		createChannel: builder.mutation<null, IChannelDTO>({
			query: data => ({
				url: API.channels,
				method: 'POST',
				body: data,
			}),
			invalidatesTags: [{ type: 'Notifications', id: 'Channels' }],
		}),
		updateChannel: builder.mutation<null, IChannelDTO>({
			query: data => ({
				url: `${API.channels}/${data.id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: [{ type: 'Notifications', id: 'Channels' }],
		}),
		deleteChannel: builder.mutation<null, string>({
			query: id => ({
				url: `${API.channels}/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [{ type: 'Notifications', id: 'Channels' }],
		}),
	}),
})

export const { useGetChannelsQuery, useCreateChannelMutation, useUpdateChannelMutation, useDeleteChannelMutation } =
	channelsApiSlice
