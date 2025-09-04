import { useState, type FC } from 'react'
import {
	Autocomplete,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField as MuiTextField,
	Checkbox,
	Typography,
} from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import type { IFilter } from '../../types/params'
import { useAppSelector } from '@/hooks/redux'
import { useLazyGetUniqueDataQuery } from '../../tableApiSlice'
import { getRealm } from '@/features/realms/realmSlice'
import { TextField } from '@/components/Form/TextField'

type Props = {
	index: number
}

export const AutocompleteFilter: FC<Props> = ({ index }) => {
	const [options, setOptions] = useState<string[]>([])
	const [open, setOpen] = useState(false)
	const realm = useAppSelector(getRealm)

	const { control, watch } = useFormContext<{ filters: IFilter[] }>()
	const field = watch(`filters.${index}.field`)
	const type = watch(`filters.${index}.compareType`)

	const [get, { isFetching }] = useLazyGetUniqueDataQuery()

	const onFocus = async () => {
		const payload = await get({ field: field, realm: realm?.id || '' }).unwrap()
		setOptions(payload?.data || [])
	}
	const onOpen = () => {
		setOpen(true)
	}
	const onClose = () => {
		setOpen(false)
	}

	return (
		<>
			<Controller
				name={`filters.${index}.compareType`}
				control={control}
				rules={{ required: true }}
				render={({ field, fieldState: { error } }) => (
					<FormControl fullWidth sx={{ maxWidth: 170 }}>
						<InputLabel id={`filters.${index}.compareType`}>Условие</InputLabel>

						<Select
							{...field}
							error={Boolean(error)}
							labelId={`filters.${index}.compareType`}
							label='Условие'
						>
							<MenuItem key='con' value='con'>
								Содержит
							</MenuItem>
							<MenuItem key='like' value='like'>
								Равен
							</MenuItem>
							<MenuItem key='start' value='start'>
								Начинается с
							</MenuItem>
							<MenuItem key='end' value='end'>
								Заканчивается на
							</MenuItem>
							<MenuItem key='in' value='in'>
								В списке
							</MenuItem>
							<MenuItem key='empty' value='null'>
								Не заполнено
							</MenuItem>
						</Select>
					</FormControl>
				)}
			/>

			{type != 'in' && (
				<TextField
					data={{
						name: `filters.${index}.value`,
						type: 'text',
						label: 'Значение',
						isRequired: type != 'null',
					}}
					disabled={type == 'null'}
				/>
			)}

			{type == 'in' && (
				<Controller
					name={`filters.${index}.value`}
					control={control}
					rules={{ required: true }}
					render={({ field: { onChange, value, ref } }) => (
						<Autocomplete
							multiple
							fullWidth
							value={value ? value.split('|') : []}
							// renderValue={() => null}
							renderValue={value =>
								!open ? (
									<Typography
										noWrap={true}
										sx={{
											pl: 1,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											pointerEvents: 'none',
											width: '100%',
											// borderLeft: '1px solid #ccc',
										}}
										color='textPrimary'
									>
										{value.join(';')}
									</Typography>
								) : null
							}
							options={options}
							disableCloseOnSelect
							disableClearable
							// getOptionLabel={option => option.title}
							loading={isFetching}
							loadingText='Поиск похожих значений...'
							noOptionsText='Ничего не найдено'
							onFocus={onFocus}
							onOpen={onOpen}
							onClose={onClose}
							onChange={(_event, value) => {
								onChange(value.join('|'))
							}}
							renderOption={(props, option, { selected }) => {
								const { key, ...optionProps } = props
								return (
									<li key={key} {...optionProps}>
										<Checkbox
											// icon={icon}
											// checkedIcon={checkedIcon}
											style={{ marginRight: 8, marginLeft: -8 }}
											checked={selected}
										/>
										{option}
									</li>
								)
							}}
							renderInput={params => (
								<MuiTextField
									{...params}
									fullWidth
									label={'Значение'}
									placeholder='Поиск'
									// error={Boolean(error)}
									// helperText={error?.message}
									inputRef={ref}
								/>
							)}
							sx={{
								maxWidth: 362,
								'.MuiOutlinedInput-root': {
									// flexDirection: 'row-reverse',
									flexWrap: 'nowrap',
								},
								'.MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
									minWidth: 0,
								},
							}}
						/>
					)}
				/>
			)}
		</>
	)
}
