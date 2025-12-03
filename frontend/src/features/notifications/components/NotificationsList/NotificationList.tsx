import { useEffect, useState, type FC } from 'react'
import { IconButton, Stack, Typography, useTheme } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { IChannel } from '../../types/channels'
import { useAppDispatch } from '@/hooks/redux'
import { useDeleteNotificationMutation, useGetNotificationsQuery } from '../../notificationsApiSlice'
import { useGetChannelsQuery } from '../../channelsApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { Fallback } from '@/components/Fallback/Fallback'
import { PlusIcon } from '@/components/Icons/PlusIcon'
import { Confirm } from '@/components/Confirm/Confirm'
import { TimesIcon } from '@/components/Icons/TimesIcon'
import { NotificationForm } from '../NotificationForm/NotificationForm'

type Props = {
	realm: string
}

export const NotificationList: FC<Props> = ({ realm }) => {
	const { palette } = useTheme()
	const [channelsMap, setChannelsMap] = useState(new Map<string, IChannel>())
	const dispatch = useAppDispatch()

	const { data: notifications, isFetching } = useGetNotificationsQuery(realm, { skip: !realm || realm === 'new' })
	const { data: channels, isFetching: isFetchingChannels } = useGetChannelsQuery(null)

	const [remove, { isLoading: isDeleting }] = useDeleteNotificationMutation()

	useEffect(() => {
		if (!channels) return
		const map = new Map<string, IChannel>()
		channels.data.forEach(c => map.set(c.channelId, c))
		setChannelsMap(map)
	}, [channels])

	const openHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'Notification', isOpen: true, context: { realm, type: 'overdue' } }))
	}

	const deleteHandler = (id: string) => async () => {
		console.log('delete id', id)
		try {
			await remove(id).unwrap()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	}

	return (
		<Stack sx={{ position: 'relative', width: '100%' }}>
			{isFetching || isFetchingChannels || isDeleting ? (
				<Fallback position={'absolute'} zIndex={5} background={'#f5f5f557'} alignItems={'flex-start'} pt={3} />
			) : null}
			<NotificationForm />

			<Stack>
				<Typography
					sx={{
						position: 'relative',
						mb: 2,
						'&:after': {
							content: '""',
							position: 'absolute',
							left: 10,
							bottom: 0,
							width: '25%',
							height: 2,
							background: 'rgb(5, 40, 127)',
						},
					}}
				>
					Уведомления о конце срока годности графита{' '}
					<IconButton onClick={openHandler} size='large' sx={{ ml: 1 }}>
						<PlusIcon fontSize={14} fill={palette.primary.main} />
					</IconButton>
				</Typography>

				{notifications?.data.map(n => (
					<Stack
						key={n.id}
						direction={'row'}
						justifyContent={'space-between'}
						alignItems={'center'}
						sx={{ mx: 2, pl: 2, borderBottom: '1px solid #dadada' }}
					>
						<Typography>
							{channelsMap.has(n.mostId || n.channelId)
								? channelsMap.get(n.mostId || n.channelId)?.name
								: n.mostId || n.channelId}
						</Typography>

						<Confirm
							onClick={deleteHandler(n.id)}
							confirmTitle={'Удалить уведомление?'}
							confirmText={'Вы уверены, что хотите удалить уведомление о конце срока годности графита?'}
							buttonComponent={
								<IconButton size='large'>
									<TimesIcon fontSize={14} />
								</IconButton>
							}
						/>
					</Stack>
				))}
			</Stack>
		</Stack>
	)
}
