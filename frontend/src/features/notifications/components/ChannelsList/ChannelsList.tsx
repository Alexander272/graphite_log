import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material'

import type { IChannel } from '../../types/channels'
import { useAppDispatch } from '@/hooks/redux'
import { useDeleteChannelMutation, useGetChannelsQuery } from '../../channelsApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { EditIcon } from '@/components/Icons/EditIcon'
import { TimesIcon } from '@/components/Icons/TimesIcon'
import ConfirmPopover from '@/components/Confirm/ConfirmPopover'
import type { IFetchError } from '@/app/types/error'
import { toast } from 'react-toastify'
import { PlusIcon } from '@/components/Icons/PlusIcon'

export const ChannelsList = () => {
	const { palette } = useTheme()
	const dispatch = useAppDispatch()

	const { data, isFetching } = useGetChannelsQuery(null)
	const [remove, { isLoading }] = useDeleteChannelMutation()

	const editHandler = (channel: IChannel) => () => {
		const context = { value: channel.name, ...channel }
		dispatch(changeDialogIsOpen({ variant: 'AddChannel', isOpen: true, context }))
	}
	const addHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'AddChannel', isOpen: true }))
	}

	const removeHandler = (id: string) => async () => {
		try {
			await remove(id).unwrap()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	}

	return (
		<TableContainer sx={{ position: 'relative', mt: -2 }}>
			{isFetching || isLoading ? <BoxFallback /> : null}

			<Table size='small'>
				<TableHead>
					<TableRow>
						<TableCell>Название</TableCell>
						<TableCell>Тип</TableCell>
						<TableCell>Id пользователя / канала</TableCell>
						<TableCell width={100}>
							<Button onClick={addHandler} sx={{ minWidth: 34, height: 30, textTransform: 'inherit' }}>
								<PlusIcon fontSize={14} fill={palette.primary.main} mr={1} /> New
							</Button>
						</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{data?.data.map(channel => (
						<TableRow key={channel.id}>
							<TableCell>{channel.name}</TableCell>
							<TableCell>{channel.type == 'person' ? 'Отправка в ЛС' : 'Отправка в канал'}</TableCell>
							<TableCell>{channel.channelId}</TableCell>
							<TableCell sx={{ py: 0 }}>
								<Button onClick={editHandler(channel)} sx={{ minWidth: 34, height: 30 }}>
									<EditIcon fontSize={14} />
								</Button>

								<ConfirmPopover
									title={'Удалить канал?'}
									description={'Это действие нельзя отменить.'}
									onConfirm={removeHandler(channel.id)}
								>
									<Button sx={{ minWidth: 34, height: 30 }}>
										<TimesIcon fontSize={12} fill={palette.error.main} />
									</Button>
								</ConfirmPopover>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}
