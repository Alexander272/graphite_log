import { memo, useMemo, type CSSProperties, type FC, type MouseEvent } from 'react'
import { useTheme } from '@mui/material'

import type { IColumn } from '../../types/table'
import type { ITableItem } from '../../types/item'
import { Formatter } from '../../utils/formatter'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getContextMenu, getVisibleFlatColumns, setContextMenu } from '../../tableSlice'
import { TableRow } from '@/components/Table/TableRow'
import { TableCell } from '@/components/Table/TableCell'
import { CellText } from '@/components/CellText/CellText'
import { CheckboxCell } from './CheckboxCell'

type Props = {
	item: ITableItem
	sx?: CSSProperties
}

export const Row: FC<Props> = memo(({ item, sx }) => {
	const { palette } = useTheme()
	const dispatch = useAppDispatch()

	// Оптимизация селекторов: выбираем только то, что нужно конкретной строке
	const columns = useAppSelector(getVisibleFlatColumns)
	const isContextActive = useAppSelector(state => getContextMenu(state)?.active === item.id)
	const isSelected = useAppSelector(state => !!state.table.selectedIds[item.id])

	const contextHandler = (event: MouseEvent<HTMLDivElement>) => {
		event.preventDefault()
		dispatch(
			setContextMenu({
				active: item.id,
				coords: { mouseX: event.clientX + 2, mouseY: event.clientY - 6 },
			}),
		)
	}

	// Вычисляем фон только при изменении статуса или активности контекстного меню
	const backgroundColor = useMemo(() => {
		if (isContextActive) return palette.rowActive.main
		if (isSelected) return palette.rowActive.light
		if (item.isOverdue) return '#ec5959ce'
		return 'transparent'
	}, [isContextActive, palette.rowActive, isSelected, item.isOverdue])

	return (
		<TableRow
			onClick={contextHandler}
			onContext={contextHandler}
			hover
			sx={{
				...sx,
				backgroundColor,
			}}
		>
			{columns.map(col => {
				if (col.id === 'selection-col') {
					return <CheckboxCell key={col.id} itemId={item.id} />
				}
				return <Cell key={col.id} item={item} col={col} />
			})}
		</TableRow>
	)
})

type CellProps = {
	item: ITableItem
	col: IColumn
}

export const Cell: FC<CellProps> = memo(({ item, col }) => {
	const value = Formatter(col.type, item[col.field as keyof ITableItem])

	return (
		<TableCell width={col.width}>
			<CellText value={value} />
		</TableCell>
	)
})
