import type { FC } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { FormControl, IconButton, InputLabel, MenuItem, Select, type SelectChangeEvent, Stack } from '@mui/material'
import dayjs from 'dayjs'

import type { CompareTypes, IFilter } from '../../types/params'
import { Columns } from '../../constants/columns'
import { TimesIcon } from '@/components/Icons/TimesIcon'
import { TextFilter } from './Text'
import { NumberFilter } from './Number'
import { DateFilter } from './Date'
import { AutocompleteFilter } from './Autocomplete'
// import { ListFilter } from './List'

const compareTypes = new Map([
	['string', 'con'],
	['date', 'eq'],
	['number', 'eq'],
	['switch', 'eq'],
	['list', 'in'],
	['autocomplete', 'in'],
])
const defaultValues = new Map([
	['string', ''],
	['date', dayjs().toISOString()],
	['number', ''],
	['switch', 'false'],
	['autocomplete', ''],
])

const columns = Columns.filter(c => c.filter)

type Props = {
	index: number
	onRemove: (index: number) => void
}

export const FilterItem: FC<Props> = ({ index, onRemove }) => {
	const methods = useFormContext<{ filters: IFilter[] }>()
	const type = methods.watch(`filters.${index}.fieldType`)

	const removeHandler = () => onRemove(index)

	return (
		<Stack direction={'row'} spacing={1} alignItems={'center'}>
			<FormControl fullWidth sx={{ maxWidth: 170 }}>
				<InputLabel id={`filters.${index}.field`}>Колонка</InputLabel>

				<Controller
					control={methods.control}
					name={`filters.${index}.field`}
					render={({ field, fieldState: { error } }) => (
						<Select
							value={`${field.value}@${type}`}
							onChange={(event: SelectChangeEvent) => {
								const newType = event.target.value.split('@')[1]
								if (newType != type) {
									methods.setValue(`filters.${index}.fieldType`, newType as 'text')
									methods.setValue(
										`filters.${index}.compareType`,
										(compareTypes.get(newType) || 'con') as CompareTypes
									)
								}
								if (newType != type || newType == 'autocomplete' || newType == 'list') {
									methods.setValue(`filters.${index}.value`, defaultValues.get(newType) || '')
								}
								field.onChange(event.target.value.split('@')[0])
							}}
							labelId={`filters.${index}.field`}
							label={'Колонка'}
							error={Boolean(error)}
						>
							{columns.map(c => (
								<MenuItem key={c.field} value={`${c.field}@${c.filter}`}>
									{c.name}
								</MenuItem>
							))}
						</Select>
					)}
				/>
			</FormControl>

			{type == 'text' && <TextFilter index={index} />}
			{type == 'number' && <NumberFilter index={index} />}
			{type == 'date' && <DateFilter index={index} />}
			{type == 'autocomplete' && <AutocompleteFilter index={index} />}
			{/* {type == 'list' && <ListFilter index={index} />} */}

			{index != 0 && (
				<IconButton onClick={removeHandler}>
					<TimesIcon fontSize={18} padding={0.4} />
				</IconButton>
			)}
		</Stack>
	)
}
