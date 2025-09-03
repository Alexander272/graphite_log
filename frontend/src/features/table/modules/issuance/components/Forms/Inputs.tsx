import { Stack } from '@mui/material'

import { DateField } from '@/components/Form/DateField'
import { NumberField } from '@/components/Form/NumberField'
import { CheckboxField } from '@/components/Form/CheckboxField'

export const Inputs = () => {
	return (
		<Stack spacing={1.5} mb={2}>
			<CheckboxField data={{ name: 'isNotFull', type: 'bool', label: 'Частичная выдача' }} />
			<DateField data={{ name: 'issuanceDate', type: 'date', label: 'Дата выдачи', isRequired: true }} />
			<NumberField data={{ name: 'amount', type: 'number', label: 'Количество, кг', isRequired: true }} />
		</Stack>
	)
}
