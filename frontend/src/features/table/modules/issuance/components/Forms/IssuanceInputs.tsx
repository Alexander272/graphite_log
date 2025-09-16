import { Stack } from '@mui/material'
import { useFormContext } from 'react-hook-form'

import { DateField } from '@/components/Form/DateField'
import { NumberField } from '@/components/Form/NumberField'
import { CheckboxField } from '@/components/Form/CheckboxField'
import type { IIssuanceDTO } from '../../types/issuance'

export const Inputs = () => {
	const { watch } = useFormContext<IIssuanceDTO>()
	const isNotFull = watch('isNotFull')

	return (
		<Stack spacing={1.5} mb={2}>
			<CheckboxField data={{ name: 'isNotFull', type: 'bool', label: 'Частичная выдача' }} />
			<DateField data={{ name: 'issuanceDate', type: 'date', label: 'Дата выдачи', isRequired: true }} />
			{isNotFull && (
				<NumberField data={{ name: 'amount', type: 'number', label: 'Количество, кг', isRequired: true }} />
			)}
		</Stack>
	)
}
