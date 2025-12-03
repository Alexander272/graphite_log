import { useState, type FC } from 'react'
import { Button, Divider, Stack } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { INotificationDTO } from '../../types/notification'
import type { IChannel } from '../../types/channels'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useCreateNotificationMutation } from '../../notificationsApiSlice'
import { changeDialogIsOpen, getDialogState } from '@/features/dialog/dialogSlice'
import { Dialog } from '@/features/dialog/components/Dialog'
import { Fallback } from '@/components/Fallback/Fallback'
import { EditIcon } from '@/components/Icons/EditIcon'
import { ChannelDialog } from '../ChannelForm/ChannelDialog'
import { ChannelsListDialog } from '../ChannelsList/ChannelsListDialog'
import { CreatableAutocomplete } from './Autocomplete'

type Context = { realm: string; type: 'overdue' }

export const NotificationForm = () => {
	const modal = useAppSelector(getDialogState('Notification'))
	const dispatch = useAppDispatch()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'Notification', isOpen: false }))
	}

	return (
		<Dialog
			title={'Добавить уведомление'}
			body={<Form {...(modal?.context as Context)} />}
			open={modal?.isOpen || false}
			onClose={closeHandler}
			maxWidth='xs'
			fullWidth
		/>
	)
}

const Form: FC<Context> = ({ realm, type }) => {
	const [channel, setChannel] = useState<IChannel | null>(null)
	const dispatch = useAppDispatch()

	const [create, { isLoading }] = useCreateNotificationMutation()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'Notification', isOpen: false }))
	}

	const openChannelsListHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'Channels', isOpen: true }))
	}

	const saveHandler = async () => {
		if (!channel) return

		const data: INotificationDTO = {
			realmId: realm,
			type: type,
			mostId: channel.type == 'person' ? channel.channelId : '',
			channelId: channel.type == 'channel' ? channel.channelId : '',
		}

		try {
			await create(data).unwrap()
			closeHandler()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	}

	return (
		<Stack position={'relative'} mt={-2}>
			{isLoading ? (
				<Fallback position={'absolute'} zIndex={5} background={'#f5f5f557'} alignItems={'flex-start'} pt={3} />
			) : null}
			<ChannelDialog />
			<ChannelsListDialog />

			<Stack direction={'row'} spacing={1}>
				<CreatableAutocomplete value={channel} onChange={setChannel} />
				<Button onClick={openChannelsListHandler} variant='outlined' sx={{ minWidth: 30 }}>
					<EditIcon fontSize={14} />
				</Button>
			</Stack>

			<Divider sx={{ width: '50%', alignSelf: 'center', mt: 2 }} />
			<Stack spacing={2} direction={'row'} mt={2}>
				<Button onClick={saveHandler} variant='contained' fullWidth>
					Сохранить
				</Button>
				<Button onClick={closeHandler} variant='outlined' fullWidth>
					Отмена
				</Button>
			</Stack>
		</Stack>
	)
}
