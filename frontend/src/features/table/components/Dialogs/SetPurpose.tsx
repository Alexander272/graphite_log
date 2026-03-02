import { IconButton } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { changeDialogIsOpen, getDialogState } from '@/features/dialog/dialogSlice'
import { getSelected } from '../../tableSlice'
import { Dialog } from '@/features/dialog/components/Dialog'
import { TimesIcon } from '@/components/Icons/TimesIcon'
import { SetPurpose } from '../Forms/SetPurpose/SetPurpose'

type Context = string

export const SetPurposeDialog = () => {
	const modal = useAppSelector(getDialogState('SetPurpose'))
	const selected = useAppSelector(getSelected)
	const dispatch = useAppDispatch()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'SetPurpose', isOpen: false }))
	}

	let ids = Object.keys(selected)
	if (!ids.length) {
		ids = modal?.context ? [modal?.context as Context] : []
	}

	return (
		<Dialog
			title={'Задать назначение'}
			headerActions={
				<IconButton onClick={closeHandler} size='large' sx={{ fill: '#505050', mr: 2 }}>
					<TimesIcon fontSize={12} />
				</IconButton>
			}
			body={<SetPurpose ids={ids} />}
			open={modal?.isOpen || false}
			onClose={closeHandler}
			maxWidth='sm'
			fullWidth
		/>
	)
}
