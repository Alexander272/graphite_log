import { IconButton, Stack, Tab, Tabs } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { changeDialogIsOpen, getDialogState } from '@/features/dialog/dialogSlice'
import { Dialog } from '@/features/dialog/components/Dialog'
import { TimesIcon } from '@/components/Icons/TimesIcon'
import { Update } from '../Forms/Update/Update'
import { useState, type FC } from 'react'
import { EditExtendingList } from '../../modules/extending/components/Forms/EditExtendingList'
import { EditIssuanceList } from '../../modules/issuance/components/Forms/EditIssuanceList'

type Context = string

export const UpdateDialog = () => {
	const modal = useAppSelector(getDialogState('UpdateTableItem'))
	const dispatch = useAppDispatch()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'UpdateTableItem', isOpen: false }))
	}

	return (
		<Dialog
			title={'Обновить позицию'}
			headerActions={
				<IconButton onClick={closeHandler} size='large' sx={{ fill: '#505050', mr: 2 }}>
					<TimesIcon fontSize={12} />
				</IconButton>
			}
			body={<UpdateTabs id={(modal?.context as Context) || ''} />}
			open={modal?.isOpen || false}
			onClose={closeHandler}
			maxWidth='md'
			fullWidth
		/>
	)
}

const UpdateTabs: FC<{ id: string }> = ({ id }) => {
	const [value, setValue] = useState('graphite')

	const tabHandler = (_event: React.SyntheticEvent, newValue: string) => {
		setValue(newValue)
	}

	return (
		<Stack spacing={3} mt={-2.5}>
			<Tabs
				value={value}
				onChange={tabHandler}
				// variant='scrollable'
				sx={{
					mt: 1,
					mb: 2,
					borderBottom: 1,
					borderColor: '#00000014',
					'.MuiTabs-scrollButtons': { transition: 'all .2s ease-in-out' },
					'.MuiTabs-scrollButtons.Mui-disabled': {
						height: 0,
					},
				}}
			>
				<Tab
					label={'Позиция'}
					value={'graphite'}
					sx={{
						textTransform: 'inherit',
						borderRadius: 3,
						transition: 'all 0.3s ease-in-out',
						minHeight: 48,
						flexGrow: 1,
						flexShrink: 1,
						maxWidth: '100%',
						width: '100%',
						':hover': {
							backgroundColor: '#f5f5f5',
						},
					}}
				/>
				<Tab
					label={'Продления'}
					value={'extending'}
					sx={{
						textTransform: 'inherit',
						borderRadius: 3,
						transition: 'all 0.3s ease-in-out',
						minHeight: 48,
						flexGrow: 1,
						flexShrink: 1,
						maxWidth: '100%',
						width: '100%',
						':hover': {
							backgroundColor: '#f5f5f5',
						},
					}}
				/>
				<Tab
					label={'Выдача'}
					value={'issuance'}
					sx={{
						textTransform: 'inherit',
						borderRadius: 3,
						transition: 'all 0.3s ease-in-out',
						minHeight: 48,
						flexGrow: 1,
						flexShrink: 1,
						maxWidth: '100%',
						width: '100%',
						':hover': {
							backgroundColor: '#f5f5f5',
						},
					}}
				/>
			</Tabs>

			{value === 'graphite' && <Update id={id} />}
			{value === 'extending' && <EditExtendingList graphite={id} />}
			{value === 'issuance' && <EditIssuanceList graphite={id} />}
		</Stack>
	)
}
