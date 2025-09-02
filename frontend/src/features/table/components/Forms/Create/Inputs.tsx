import { useState, type FC } from 'react'
import { Stack } from '@mui/material'
import { useAppSelector } from '@/hooks/redux'

import type { Field } from '@/components/Form/type'
import { useLazyGetUniqueDataQuery } from '@/features/table/tableApiSlice'
import { getRealm } from '@/features/realms/realmSlice'
import { FormField } from '@/components/Form/Form'
import { AutocompleteField } from '@/components/Form/AutocompleteField'
import { Fields } from './fields'

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
}

const AutocompleteInput: FC<{ field: Field }> = ({ field }) => {
	const [options, setOptions] = useState<string[]>([])
	const realm = useAppSelector(getRealm)

	const [get, { isFetching }] = useLazyGetUniqueDataQuery()

	const onFocus = async () => {
		const payload = await get({ field: field.name, realm: realm?.id || '' }).unwrap()
		setOptions(payload?.data || [])
	}

	return <AutocompleteField data={field} options={options || []} isLoading={isFetching} onFocus={onFocus} />
}
