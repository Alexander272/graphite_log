import { IconButton } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { changeDialogIsOpen, getDialogState } from '@/features/dialog/dialogSlice'
import { Dialog } from '@/features/dialog/components/Dialog'
import { TimesIcon } from '@/components/Icons/TimesIcon'
import { SetPurpose } from '../Forms/SetPurpose/SetPurpose'

type Context = string

export const SetPurposeDialog = () => {
	const modal = useAppSelector(getDialogState('SetPurpose'))
	const dispatch = useAppDispatch()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'SetPurpose', isOpen: false }))
	}

	return (
		<Dialog
			title={'Задать назначение'}
			headerActions={
				<IconButton onClick={closeHandler} size='large' sx={{ fill: '#505050', width: 42 }}>
					<TimesIcon fontSize={12} />
				</IconButton>
			}
			body={<SetPurpose id={(modal?.context as Context) || ''} />}
			open={modal?.isOpen || false}
			onClose={closeHandler}
			maxWidth='sm'
			fullWidth
		/>
	)
}
