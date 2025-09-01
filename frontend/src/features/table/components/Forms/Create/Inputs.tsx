import { useState, type FC } from 'react'

import type { Field, Option } from '@/components/Form/type'
import { FormField } from '@/components/Form/Form'
import { AutocompleteField } from '@/components/Form/AutocompleteField'
import { Fields } from './fields'
import { Stack } from '@mui/material'

export const Inputs = () => {
	return (
		<Stack spacing={1.5} mb={2}>
			{Fields.map(f => {
				switch (f.type) {
					case 'autocomplete':
						return <AutocompleteInput key={f.name} field={f} />
					default:
						return <FormField key={f.name} item={f} />
				}
			})}
		</Stack>
	)

	// return <div>Inputs</div>
}

const AutocompleteInput: FC<{ field: Field }> = ({ field }) => {
	const [options, setOptions] = useState<Option[]>([])

	//TODO get values
	const isLoading = false
	const onFocus = () => {
		setOptions([])
	}

	return <AutocompleteField data={field} options={options || []} isLoading={isLoading} onFocus={onFocus} />
}
