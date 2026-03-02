import { memo, useMemo, type FC, type JSX } from 'react'

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
import { HeaderCheckbox } from './HeaderCheckbox'

export const Head: FC = memo(() => {
	const sort = useAppSelector(getSort)
	const columns = useAppSelector(getColumns) // Берем исходные колонки для групп
	const { width, hasFewRows } = useCalcWidth(columns)
	const height = (hasFewRows ? 2 : 1) * RowHeight

	const sortKeys = useMemo(() => Object.keys(sort), [sort])

	const renderContent = useMemo(() => {
		const header: JSX.Element[] = []

		// Добавляем чекбокс "Выбрать все"
		header.push(
			<TableCell key='selection-head' width={50}>
				<HeaderCheckbox />
			</TableCell>,
		)

		columns.forEach(c => {
			if (c.hidden) return

			if (c.children) {
				const visibleChildren = c.children.filter(child => !child.hidden)
				if (visibleChildren.length === 0) return

				const groupWidth = visibleChildren.reduce((acc, child) => acc + (child.width || ColWidth), 0)

				header.push(
					<TableGroup key={c.field}>
						<TableRow>
							<TableCell width={groupWidth}>
								<CellText value={c.name} />
							</TableCell>
						</TableRow>
						<TableRow>
							{visibleChildren.map(child => (
								<HeaderCell
									key={child.field}
									col={child}
									sortValue={sort[child.field]}
									sortIndex={sortKeys.indexOf(child.field)}
									totalSorts={sortKeys.length}
								/>
							))}
						</TableRow>
					</TableGroup>,
				)
			} else {
				header.push(
					<HeaderCell
						key={c.field}
						col={c}
						sortValue={sort[c.field]}
						sortIndex={sortKeys.indexOf(c.field)}
						totalSorts={sortKeys.length}
					/>,
				)
			}
		})

		return header
	}, [columns, sort, sortKeys])

	return (
		<TableHead>
			<TableRow width={width} height={height}>
				{renderContent}
			</TableRow>
		</TableHead>
	)
})

const HeaderCell: FC<{ col: IColumn; sortValue: 'ASC' | 'DESC' | null; sortIndex: number; totalSorts: number }> = memo(
	({ col, sortValue, sortIndex, totalSorts }) => {
		const dispatch = useAppDispatch()

		const handleSort = () => {
			if (col.allowSort) dispatch(setSort(col.field))
		}

		return (
			<TableCell width={col.width || ColWidth} isActive onClick={col.allowSort ? handleSort : undefined}>
				<CellText value={col.name} />
				{col.allowSort && (
					<Badge color='primary' badgeContent={sortIndex + 1} invisible={totalSorts < 2 || sortIndex === -1}>
						<SortUpIcon
							fontSize={16}
							fill={sortValue ? 'black' : '#adadad'}
							transform={!sortValue || sortValue === 'ASC' ? '' : 'rotateX(180deg)'}
							transition={'.2s all ease-in-out'}
						/>
					</Badge>
				)}
			</TableCell>
		)
	},
)
