import { useMemo, type FC } from 'react'
import { TableContainer, Typography } from '@mui/material'
import dayjs from 'dayjs'

import type { IChange } from '../types/changes'
import type { IIssuance } from '../../issuance/types/issuance'
import { NoRowsOverlay } from '@/features/table/components/NoRowsOverlay/components/NoRowsOverlay'
import { Table } from '@/components/Table/Table'
import { TableHead } from '@/components/Table/TableHead'
import { TableRow } from '@/components/Table/TableRow'
import { TableCell } from '@/components/Table/TableCell'
import { TableBody } from '@/components/Table/TableBody'

type Props = {
	data: IChange[]
}

const formatIssuance = (item: IIssuance | null) => {
	if (!item) return ''
	const action = item.type === 'issuance' ? 'Выдан' : 'Возвращен'
	const amount = item.amount ? `о ${item.amount} кг` : ''
	const date = dayjs(item.issuanceDate).format('DD.MM.YYYY')
	return `${action}${amount} ${date}`
}

export const Issuance: FC<Props> = ({ data }) => {
	const preparedData = useMemo(() => {
		return data.map(item => {
			let original: IIssuance | null = null
			let changed: IIssuance | string | null = null

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
				originalText: formatIssuance(original),
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
						{preparedData.map(row => (
							<TableRow key={row.id} sx={{ minHeight: 38, cursor: 'default' }}>
								<TableCell width={160}>{row.created}</TableCell>
								<TableCell width={240}>
									<Typography>{row.originalText}</Typography>
								</TableCell>
								<TableCell width={240}>
									{typeof row.changed === 'string' ? (
										<Typography variant='body2' fontWeight={700} color='error'>
											(Удалено)
										</Typography>
									) : (
										<Typography variant='body2' fontWeight={700}>
											{formatIssuance(row.changed as IIssuance)}
										</Typography>
									)}
								</TableCell>
								<TableCell width={210}>{row.userName}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</TableContainer>
	)
}
