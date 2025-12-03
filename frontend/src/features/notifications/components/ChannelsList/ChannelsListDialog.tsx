import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { changeDialogIsOpen, getDialogState } from '@/features/dialog/dialogSlice'
import { Dialog } from '@/features/dialog/components/Dialog'
import { ChannelsList } from './ChannelsList'

export const ChannelsListDialog = () => {
	const modal = useAppSelector(getDialogState('Channels'))
	const dispatch = useAppDispatch()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'Channels', isOpen: false }))
	}

	return (
		<Dialog
			title={'Список каналов'}
			body={<ChannelsList />}
			open={modal?.isOpen || false}
			onClose={closeHandler}
			maxWidth='md'
			fullWidth
		/>
	)
}
