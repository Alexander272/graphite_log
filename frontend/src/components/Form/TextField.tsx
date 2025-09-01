import type { FC } from 'react'
import { FormControl, TextField as MTextField } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import type { Field } from './type'

type Props = {
	data: Field
}

export const TextField: FC<Props> = ({ data }) => {
	const { control } = useFormContext()

	return (
		<FormControl>
			<Controller
				control={control}
				name={data.name}
				rules={{ required: data.isRequired }}
				render={({ field, fieldState: { error } }) => (
					<MTextField
						{...field}
						value={field.value || ''}
						label={data.label}
						fullWidth
						error={Boolean(error)}
						multiline
					/>
				)}
			/>
		</FormControl>
	)
}
