import { useRef, useState } from 'react'
import { Button, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import type { IColumn } from '../../types/table'
import { Columns } from '../../constants/columns'
import { ColWidth } from '../../constants/defaultValues'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getColumns, setColumns } from '../../tableSlice'
import { Popover } from '@/components/Popover/Popover'
import { SettingIcon } from '@/components/Icons/SettingIcon'
import { CheckIcon } from '@/components/Icons/CheckSimpleIcon'
import { RefreshIcon } from '@/components/Icons/RefreshIcon'
import { Item } from './Item'

export default function ColumnsSetting() {
	const { palette } = useTheme()

	const [open, setOpen] = useState(false)
	const anchor = useRef(null)

	const columns = useAppSelector(getColumns)
	const dispatch = useAppDispatch()

	// const methods = useForm<{ [key: string]: boolean }>({
	// 	values: HeadCells.reduce((a, v) => ({ ...a, [v.id]: hidden[v.id] || false }), {}),
	// })
	const methods = useForm<{ data: IColumn[] }>({ values: { data: columns } })
	const { control, handleSubmit } = methods
	const { fields } = useFieldArray({ control, name: 'data' })

	const toggleHandler = () => setOpen(prev => !prev)
	const closeHandler = () => toggleHandler()

	const resetHandler = () => {
		dispatch(setColumns([...Columns]))
		closeHandler()
	}

	const applyHandler = handleSubmit(form => {
		console.log('apply', form)
		dispatch(setColumns(form.data.map(c => ({ ...c, width: +(c.width ? c.width : ColWidth) }))))
		closeHandler()
	})

	return (
		<>
			<IconButton ref={anchor} onClick={toggleHandler} sx={{ my: '-3px!important', width: 42.5 }}>
				<SettingIcon fontSize={20} />
			</IconButton>

			<Popover
				open={open}
				onClose={closeHandler}
				anchorEl={anchor.current}
				paperSx={{
					padding: 0,
					maxWidth: 500,
					'&:before': {
						content: '""',
						display: 'block',
						position: 'absolute',
						top: 0,
						right: '35%',
						width: 10,
						height: 10,
						bgcolor: 'background.paper',
						transform: 'translate(-50%, -50%) rotate(45deg)',
						zIndex: 0,
					},
				}}
			>
				<Stack direction={'row'} mx={2} mt={1} mb={2.5} justifyContent={'space-between'} alignItems={'center'}>
					<Typography fontSize={'1.1rem'}>Настройка колонок</Typography>

					<Stack direction={'row'} spacing={1} height={34}>
						<Tooltip title='Сбросить настройки'>
							<Button onClick={resetHandler} variant='outlined' color='inherit' sx={{ minWidth: 40 }}>
								<RefreshIcon fontSize={18} />
							</Button>
						</Tooltip>

						<Button onClick={applyHandler} variant='contained' sx={{ minWidth: 40, padding: '6px 15px' }}>
							<CheckIcon fill={palette.common.white} fontSize={20} />
						</Button>
					</Stack>
				</Stack>

				<Stack maxHeight={450} overflow={'auto'} pl={2} pr={1}>
					<FormProvider {...methods}>
						{fields.map((f, i) => (
							<Item key={f.id} index={i} label={f.name} />
						))}
					</FormProvider>
				</Stack>
			</Popover>
		</>
	)
}
