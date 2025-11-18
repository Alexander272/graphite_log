import { type FC, type JSX } from 'react'

import type { IColumn } from '../../types/table'
import { ColWidth, RowHeight } from '../../constants/defaultValues'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useCalcWidth } from '../../utils/calcWidth'
import { getColumns, getSort, setSort } from '../../tableSlice'
import { TableGroup } from '@/components/Table/TableGroup'
import { TableHead } from '@/components/Table/TableHead'
import { TableRow } from '@/components/Table/TableRow'
import { TableCell } from '@/components/Table/TableCell'
import { CellText } from '@/components/CellText/CellText'
import { Badge } from '@/components/Badge/Badge'
import { SortUpIcon } from '@/components/Icons/SortUpIcon'

type Props = unknown

export const Head: FC<Props> = () => {
	return (
		<TableHead>
			<Row />
		</TableHead>
	)
}

const Row = () => {
	const sort = useAppSelector(getSort)
	const columns = useAppSelector(getColumns)
	// const hidden = useAppSelector(getHidden)

	const { width, hasFewRows } = useCalcWidth(columns)
	const height = (hasFewRows ? 2 : 1) * RowHeight

	const dispatch = useAppDispatch()

	const setSortHandler = (field: string) => () => {
		dispatch(setSort(field))
	}

	const getCell = (c: IColumn) => {
		return (
			<TableCell
				key={c.field}
				width={c.width || ColWidth}
				isActive
				onClick={c.allowSort ? setSortHandler(c.field) : undefined}
			>
				<CellText value={c.name} />
				{c.allowSort ? (
					<Badge
						color='primary'
						badgeContent={Object.keys(sort).findIndex(k => k == c.field) + 1}
						invisible={Object.keys(sort).length < 2}
					>
						<SortUpIcon
							fontSize={16}
							fill={sort[c.field] ? 'black' : '#adadad'}
							transform={!sort[c.field] || sort[c.field] == 'ASC' ? '' : 'rotateX(180deg)'}
							transition={'.2s all ease-in-out'}
						/>
					</Badge>
				) : null}
			</TableCell>
		)
	}
	const renderHeader = () => {
		const header: JSX.Element[] = []

		columns.forEach(c => {
			if (c.children && !c?.hidden) {
				let width = 0
				const subhead: JSX.Element[] = []

				c.children.forEach(c => {
					if (!c?.hidden) {
						width += c.width || ColWidth

						subhead.push(getCell(c))
					}
				})

				if (subhead.length > 0) {
					header.push(
						<TableGroup key={c.field}>
							<TableRow>
								<TableCell width={width} key={c.field}>
									<CellText value={c.name} />
								</TableCell>
							</TableRow>
							<TableRow>{subhead}</TableRow>
						</TableGroup>
					)
				}
			} else if (!c?.hidden) {
				header.push(getCell(c))
			}
		})

		return header
	}

	return (
		<TableRow width={width} height={height}>
			{renderHeader()}
		</TableRow>
	)
}
