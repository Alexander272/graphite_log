import { Stack } from '@mui/material'

import { DateField } from '@/components/Form/DateField'
import { NumberField } from '@/components/Form/NumberField'
import { TextField } from '@/components/Form/TextField'

export const Inputs = () => {
	return (
		<Stack spacing={1.5} mb={2}>
			<DateField data={{ name: 'date', type: 'date', label: 'Дата продления', isRequired: true }} />
			<TextField data={{ name: 'act', type: 'text', label: 'Документ о продлении', isRequired: false }} />
			<NumberField data={{ name: 'period', type: 'number', label: 'Период продления, мес', isRequired: true }} />
		</Stack>
	)
}
