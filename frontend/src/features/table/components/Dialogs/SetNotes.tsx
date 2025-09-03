import { IconButton } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { changeDialogIsOpen, getDialogState } from '@/features/dialog/dialogSlice'
import { Dialog } from '@/features/dialog/components/Dialog'
import { TimesIcon } from '@/components/Icons/TimesIcon'
import { SetNotes } from '../Forms/SetNotes/SetNotes'

type Context = string

export const SetNotesDialog = () => {
	const modal = useAppSelector(getDialogState('SetNotes'))
	const dispatch = useAppDispatch()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'SetNotes', isOpen: false }))
	}

	return (
		<Dialog
			title={'Изменить примечание'}
			headerActions={
				<IconButton onClick={closeHandler} size='large' sx={{ fill: '#505050', width: 42 }}>
					<TimesIcon fontSize={12} />
				</IconButton>
			}
			body={<SetNotes id={(modal?.context as Context) || ''} />}
			open={modal?.isOpen || false}
			onClose={closeHandler}
			maxWidth='sm'
			fullWidth
		/>
	)
}
