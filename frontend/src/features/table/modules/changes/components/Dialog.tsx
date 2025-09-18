import { IconButton } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { changeDialogIsOpen, getDialogState } from '@/features/dialog/dialogSlice'
import { Dialog } from '@/features/dialog/components/Dialog'
import { TimesIcon } from '@/components/Icons/TimesIcon'
import { Changes } from './Changes'

type Context = string

export const ChangesDialog = () => {
	const modal = useAppSelector(getDialogState('Changes'))
	const dispatch = useAppDispatch()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'Changes', isOpen: false }))
	}

	return (
		<Dialog
			title={'История изменений'}
			headerActions={
				<IconButton onClick={closeHandler} size='large' sx={{ fill: '#505050', mr: 2 }}>
					<TimesIcon fontSize={12} />
				</IconButton>
			}
			body={<Changes graphite={(modal?.context as Context) || ''} />}
			open={modal?.isOpen || false}
			onClose={closeHandler}
			maxWidth='md'
			fullWidth
		/>
	)
}
