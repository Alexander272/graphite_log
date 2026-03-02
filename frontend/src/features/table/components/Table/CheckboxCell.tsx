import { memo } from 'react'
import { Checkbox } from '@mui/material'

import { useAppSelector, useAppDispatch } from '@/hooks/redux'
import { toggleSelect } from '../../tableSlice'
import { TableCell } from '@/components/Table/TableCell'

export const CheckboxCell = memo(({ itemId }: { itemId: string | number }) => {
	const dispatch = useAppDispatch()

	const isSelected = useAppSelector(state => !!state.table.selectedIds[itemId])

	const handleCheckboxClick = (event: React.MouseEvent) => {
		event.stopPropagation()
	}

	const handleChange = () => {
		dispatch(toggleSelect(itemId))
	}

	return (
		<TableCell width={50} onClick={handleCheckboxClick}>
			<Checkbox checked={isSelected} onChange={handleChange} size='small' />
		</TableCell>
	)
})
