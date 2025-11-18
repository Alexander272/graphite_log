import type { CSSProperties, FC, MouseEvent } from 'react'
import { useTheme } from '@mui/material'

import type { IColumn } from '../../types/table'
import type { ITableItem } from '../../types/item'
import { Formatter } from '../../utils/formatter'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getColumns, getContextMenu, setContextMenu } from '../../tableSlice'
import { TableRow } from '@/components/Table/TableRow'
import { TableCell } from '@/components/Table/TableCell'
import { CellText } from '@/components/CellText/CellText'

type Props = {
	item: ITableItem
	sx?: CSSProperties
}

export const Row: FC<Props> = ({ item, sx }) => {
	const { palette } = useTheme()

	const columns = useAppSelector(getColumns)
	const contextMenu = useAppSelector(getContextMenu)
	const dispatch = useAppDispatch()

	// const selectHandler = () => {
	// 	dispatch(setSelected(item.id))
	// }

	const contextHandler = (event: MouseEvent<HTMLDivElement>) => {
		event.preventDefault()
		const menu = {
			active: item.id,
			coords: { mouseX: event.clientX + 2, mouseY: event.clientY - 6 },
		}
		dispatch(setContextMenu(menu))
	}

	let background = ''
	if (item.isOverdue) background = '#ec5959ce'
	if (contextMenu?.active == item.id) background = palette.rowActive.main

	return (
		<TableRow
			onClick={contextHandler}
			onContext={contextHandler}
			hover
			sx={{
				...sx,
				// padding: '0 6px',
				// width: 'fit-content',
				backgroundColor: background,
			}}
		>
			{columns.map(c => {
				if (c?.hidden) return null
				if (c.children) {
					return c.children.map(c => {
						if (c?.hidden) return null
						return <Cell key={c.id} item={item} col={c} />
					})
				}
				return <Cell key={c.id} item={item} col={c} />
			})}
		</TableRow>
	)
}

type CellProps = {
	item: ITableItem
	col: IColumn
}

const Cell: FC<CellProps> = ({ item, col }) => {
	return (
		<TableCell key={item.id + col.field} width={col.width}>
			<CellText value={Formatter(col.type, item[col.field as keyof ITableItem])} />
		</TableCell>
	)
}
