import { useMemo, type FC } from 'react'
import { TableContainer, Typography } from '@mui/material'
import dayjs from 'dayjs'

import type { IChange } from '../types/changes'
import type { IExtending } from '../../extending/types/extending'
import { NoRowsOverlay } from '@/features/table/components/NoRowsOverlay/components/NoRowsOverlay'
import { Table } from '@/components/Table/Table'
import { TableHead } from '@/components/Table/TableHead'
import { TableRow } from '@/components/Table/TableRow'
import { TableCell } from '@/components/Table/TableCell'
import { TableBody } from '@/components/Table/TableBody'

type Props = {
	data: IChange[]
}

export const Extending: FC<Props> = ({ data }) => {
	const preparedData = useMemo(() => {
		return data.map(item => {
			let original: IExtending | null = null
			let changed: IExtending | string | null = null

			try {
				original = JSON.parse(item.original)
				if (typeof item.changed === 'string' && !item.changed.startsWith('{')) changed = item.changed
				else changed = JSON.parse(item.changed)
			} catch (e) {
				console.error('Failed to parse log item', e)
			}

			return {
				id: item.id,
				created: dayjs(item.created).format('DD.MM.YYYY HH:mm'),
				userName: item.userName,
				orig: original,
				changed,
			}
		})
	}, [data])

	return (
		<TableContainer sx={{ minHeight: 150, position: 'relative' }}>
			{!data.length ? (
				<NoRowsOverlay />
			) : (
				<Table>
					<TableHead>
						<TableRow height={40} sx={{ cursor: 'default' }}>
							<TableCell width={160}>Дата изменения</TableCell>
							<TableCell width={240}>Предыдущее значение</TableCell>
							<TableCell width={240}>Новое значение</TableCell>
							<TableCell width={210}>Пользователь</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{preparedData.map(item => (
							<TableRow key={item.id} sx={{ minHeight: 38, cursor: 'default' }}>
								<TableCell width={160}>{dayjs(item.created).format('DD.MM.YYYY HH:mm')}</TableCell>
								<TableCell width={240}>
									{item.orig?.act} на {item.orig?.period} мес.
								</TableCell>
								<TableCell width={240}>
									<Typography fontWeight={700}>
										{typeof item.changed == 'string'
											? '(Удалено)'
											: `${item.changed?.act} на ${item.changed?.period} мес.`}
									</Typography>
								</TableCell>
								<TableCell width={210}>{item.userName}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</TableContainer>
	)
}
