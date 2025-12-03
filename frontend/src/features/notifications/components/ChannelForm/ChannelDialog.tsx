import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { changeDialogIsOpen, getDialogState } from '@/features/dialog/dialogSlice'
import { Dialog } from '@/features/dialog/components/Dialog'
import { ChannelForm } from './ChannelForm'

type Context = { id?: string; value: string; type?: 'person' | 'channel'; channelId?: string }

export const ChannelDialog = () => {
	const modal = useAppSelector(getDialogState('AddChannel'))
	const dispatch = useAppDispatch()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'AddChannel', isOpen: false }))
	}

	return (
		<Dialog
			title={'Добавить канал'}
			body={<ChannelForm defData={modal?.context as Context} onCancel={closeHandler} onClose={closeHandler} />}
			open={modal?.isOpen || false}
			onClose={closeHandler}
			maxWidth='xs'
			fullWidth
		/>
	)
}
