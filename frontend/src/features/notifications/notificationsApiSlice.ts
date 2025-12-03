import { toast } from 'react-toastify'

import type { IBaseFetchError } from '@/app/types/error'
import type { INotification, INotificationDTO } from './types/notification'
import { API } from '@/app/api'
import { apiSlice } from '@/app/apiSlice'

export const notificationsApiSlice = apiSlice.injectEndpoints({
	overrideExisting: false,
	endpoints: builder => ({
		getNotifications: builder.query<{ data: INotification[] }, string>({
			query: realm => ({
				url: API.notifications,
				method: 'GET',
				params: { realm },
			}),
			providesTags: [{ type: 'Notifications', id: 'ALL' }],
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
		createNotification: builder.mutation<null, INotificationDTO>({
			query: notification => ({
				url: API.notifications,
				method: 'POST',
				body: notification,
			}),
			invalidatesTags: [{ type: 'Notifications', id: 'ALL' }],
		}),
		updateNotification: builder.mutation<null, INotificationDTO>({
			query: notification => ({
				url: `${API.notifications}/${notification.id}`,
				method: 'PUT',
				body: notification,
			}),
			invalidatesTags: [{ type: 'Notifications', id: 'ALL' }],
		}),
		deleteNotification: builder.mutation<null, string>({
			query: id => ({
				url: `${API.notifications}/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [{ type: 'Notifications', id: 'ALL' }],
		}),
	}),
})

export const {
	useGetNotificationsQuery,
	useCreateNotificationMutation,
	useUpdateNotificationMutation,
	useDeleteNotificationMutation,
} = notificationsApiSlice
