import { useState } from 'react'
import { IconButton, Stack, Tooltip } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { localKeys } from '../../constants/storage'
import { changeDialogIsOpen, getDialogState } from '@/features/dialog/dialogSlice'
import { Dialog } from '@/features/dialog/components/Dialog'
import { TimesIcon } from '@/components/Icons/TimesIcon'
import { RefreshIcon } from '@/components/Icons/RefreshIcon'
import { Create } from '../Forms/Create/Create'

export const CreateDialog = () => {
	const [reset, setReset] = useState(false)

	const modal = useAppSelector(getDialogState('CreateTableItem'))
	const dispatch = useAppDispatch()

	const resetHandler = () => {
		localStorage.removeItem(localKeys.form)
		setReset(true)
	}

	const closeHandler = () => {
		setReset(false)
		dispatch(changeDialogIsOpen({ variant: 'CreateTableItem', isOpen: false }))
	}

	return (
		<Dialog
			title={'Добавить позицию'}
			headerActions={
				<Stack direction={'row'} spacing={1} mr={2}>
					{localStorage.getItem(localKeys.form) && (
						<Tooltip title='Очистить'>
							<IconButton onClick={resetHandler} size='large' sx={{ fill: '#505050' }}>
								<RefreshIcon fontSize={16} />
							</IconButton>
						</Tooltip>
					)}

					<IconButton onClick={closeHandler} size='large' sx={{ fill: '#505050', width: 40 }}>
						<TimesIcon fontSize={12} />
					</IconButton>
				</Stack>
			}
			body={<Create reset={reset} />}
			open={modal?.isOpen || false}
			onClose={closeHandler}
			maxWidth='md'
			fullWidth
		/>
	)
}
