import type { FC } from 'react'
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

export const Issuance: FC<Props> = ({ data }) => {
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
						{data.map(item => {
							const original = JSON.parse(item.original) as IIssuance
							const changed = JSON.parse(item.changed) as IIssuance

							return (
								<TableRow key={item.id} sx={{ minHeight: 38, cursor: 'default' }}>
									<TableCell width={160}>{dayjs(item.created).format('DD.MM.YYYY HH:mm')}</TableCell>
									<TableCell width={240}>
										<Typography>
											{[
												original.type == 'issuance' ? 'Выдан' : 'Возвращен',
												original.amount ? `о ${original.amount} кг` : '',
												' ',
												dayjs(original.issuanceDate).format('DD.MM.YYYY'),
											].join('')}
										</Typography>
									</TableCell>
									<TableCell width={240}>
										{typeof changed == 'string' ? (
											<Typography fontWeight={700}>(Удалено)</Typography>
										) : (
											<Typography fontWeight={700}>
												{[
													changed.type == 'issuance' ? 'Выдан' : 'Возвращен',
													changed.amount ? `о ${changed.amount} кг` : '',
													' ',
													dayjs(changed.issuanceDate).format('DD.MM.YYYY'),
												].join('')}
											</Typography>
											// <Typography>
											// 	<Typography component={'span'} fontWeight={700}>
											// 		{[
											// 			changed.type == 'issuance' ? 'Выдан' : 'Возвращен',
											// 			changed.amount ? `о ${changed.amount} кг` : '',
											// 		].join('')}
											// 	</Typography>{' '}
											// 	<Typography component={'span'} fontWeight={700}>
											// 		{dayjs(changed.issuanceDate).format('DD.MM.YYYY')}
											// 	</Typography>
											// </Typography>
										)}
									</TableCell>
									<TableCell width={210}>{item.userName}</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			)}
		</TableContainer>
	)
}
