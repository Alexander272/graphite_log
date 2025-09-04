import { useRef, useState } from 'react'
import { Button, Popover, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import type { IFilter } from '../../types/params'
import { Columns } from '../../constants/columns'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getFilters, setFilters } from '../../tableSlice'
import { Badge } from '@/components/Badge/Badge'
import { FilterIcon } from '@/components/Icons/FilterIcon'
import { TimesIcon } from '@/components/Icons/TimesIcon'
import { PlusIcon } from '@/components/Icons/PlusIcon'
import { CheckIcon } from '@/components/Icons/CheckSimpleIcon'
import { FilterItem } from './Item'

const columns = Columns.filter(c => c.filter)

const defaultValue: IFilter = {
	field: columns[1].field,
	fieldType: columns[1].filter!,
	compareType: 'in',
	value: '',
}

export const Filters = () => {
	const [open, setOpen] = useState(false)
	const anchor = useRef<HTMLButtonElement>(null)

	const filters = useAppSelector(getFilters)
	const dispatch = useAppDispatch()

	const { palette } = useTheme()

	const methods = useForm<{ filters: IFilter[] }>({
		values: {
			filters: filters.length ? filters : [defaultValue],
		},
	})
	const { fields, append, remove } = useFieldArray({ control: methods.control, name: 'filters' })

	const toggleHandler = () => setOpen(prev => !prev)
	const closeHandler = () => {
		toggleHandler()
	}

	const addNewHandler = () => {
		append(defaultValue)
	}
	const removeHandler = (index: number) => {
		remove(index)
	}

	const resetHandler = () => {
		dispatch(setFilters([]))
		closeHandler()
	}
	const applyHandler = methods.handleSubmit(form => {
		console.log('form', form)

		const groupedMap = new Map<string, IFilter[]>()
		for (const e of form.filters) {
			e.field = e.field.split('@')[0]
			let thisList = groupedMap.get(e.field)
			if (thisList === undefined) {
				thisList = []
				groupedMap.set(e.field, thisList)
			}
			thisList.push(e)
		}
		const filters: IFilter[] = []
		groupedMap.forEach(v => filters.push(...v))

		dispatch(setFilters(filters))
		closeHandler()
	})

	return (
		<>
			<Button
				ref={anchor}
				onClick={toggleHandler}
				variant='outlined'
				color='inherit'
				sx={{ minWidth: 30, paddingX: 1.5, textTransform: 'capitalize' }}
			>
				<Badge
					color='primary'
					variant={filters.length < 2 ? 'dot' : 'standard'}
					badgeContent={filters.length}
					anchorOrigin={{ horizontal: 'left' }}
				>
					<FilterIcon fontSize={16} mr={1} />
				</Badge>
				Фильтры
			</Button>

			<Popover
				open={open}
				onClose={toggleHandler}
				anchorEl={anchor.current}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
				slotProps={{
					paper: {
						elevation: 0,
						sx: {
							overflow: 'visible',
							filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							mt: 1,
							paddingX: 2,
							pt: 1.5,
							paddingBottom: 2,
							maxWidth: 750,
							width: '100%',
							'&:before': {
								content: '""',
								display: 'block',
								position: 'absolute',
								top: 0,
								right: '12%',
								width: 10,
								height: 10,
								bgcolor: 'background.paper',
								transform: 'translate(-50%, -50%) rotate(45deg)',
								zIndex: 0,
							},
						},
					},
				}}
			>
				<Stack>
					<Stack direction={'row'} mb={2.5} justifyContent={'space-between'} alignItems={'center'}>
						<Typography fontSize={'1.1rem'}>Применить фильтр</Typography>

						<Stack direction={'row'} spacing={1} height={34}>
							<Button
								onClick={addNewHandler}
								variant='outlined'
								sx={{ minWidth: 40, padding: '5px 14px' }}
							>
								<PlusIcon fill={palette.primary.main} fontSize={14} />
							</Button>

							<Tooltip title='Сбросить фильтры' enterDelay={700}>
								<Button onClick={resetHandler} variant='outlined' color='inherit' sx={{ minWidth: 40 }}>
									<TimesIcon fill={'#212121'} fontSize={12} />
								</Button>
							</Tooltip>

							<Tooltip title='Применить фильтры' enterDelay={700}>
								<Button
									onClick={applyHandler}
									type='submit'
									variant='contained'
									sx={{ minWidth: 40, padding: '6px 12px' }}
								>
									<CheckIcon fill={palette.common.white} fontSize={20} />
								</Button>
							</Tooltip>
						</Stack>
					</Stack>

					<Stack spacing={1.5}>
						<FormProvider {...methods}>
							{fields.map((f, i) => (
								<FilterItem key={f.id} index={i} onRemove={removeHandler} />
							))}
						</FormProvider>
					</Stack>
				</Stack>
			</Popover>
		</>
	)
}
