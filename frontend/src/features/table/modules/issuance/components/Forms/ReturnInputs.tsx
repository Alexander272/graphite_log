import { Autocomplete, Stack, TextField } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import type { IReturnDTO } from '../../types/issuance'
import { useAppSelector } from '@/hooks/redux'
import { useGetUniqueDataQuery } from '@/features/table/tableApiSlice'
import { getRealm } from '@/features/realms/realmSlice'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { DateField } from '@/components/Form/DateField'
import { NumberField } from '@/components/Form/NumberField'
import { CheckboxField } from '@/components/Form/CheckboxField'

export const Inputs = () => {
	const realm = useAppSelector(getRealm)

	const { control, watch } = useFormContext<IReturnDTO>()
	const isFull = watch('isFull')

	const { data, isFetching } = useGetUniqueDataQuery({ field: 'place', realm: realm?.id || '' }, { skip: !realm?.id })

	if (isFetching) return <BoxFallback />
	return (
		<Stack spacing={1.5} mb={2}>
			<CheckboxField data={{ name: 'isFull', type: 'bool', label: 'Возвращен весь объем' }} />
			<DateField data={{ name: 'issuanceDate', type: 'date', label: 'Дата возврата', isRequired: true }} />
			{!isFull && (
				<NumberField data={{ name: 'amount', type: 'number', label: 'Количество, кг', isRequired: true }} />
			)}

			<Controller
				name={'place'}
				control={control}
				rules={{ required: true }}
				render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
					<Autocomplete
						value={value || ''}
						freeSolo
						disableClearable
						autoComplete
						options={data?.data || []}
						loading={isFetching}
						loadingText='Поиск похожих значений...'
						noOptionsText='Ничего не найдено'
						onChange={(_event, value) => {
							onChange(value)
						}}
						renderInput={params => (
							<TextField
								{...params}
								label={'Место нахождения'}
								onChange={onChange}
								fullWidth
								multiline
								error={Boolean(error)}
								helperText={error?.message}
								inputRef={ref}
							/>
						)}
					/>
				)}
			/>
		</Stack>
	)
}
