import { useRef, useState, type FC } from 'react'
import { Box, IconButton, Popover, TableContainer, Typography } from '@mui/material'
import dayjs from 'dayjs'

import type { IChange } from '../types/changes'
import { Columns } from '@/features/table/constants/columns'
import { NoRowsOverlay } from '@/features/table/components/NoRowsOverlay/components/NoRowsOverlay'
import { Table } from '@/components/Table/Table'
import { TableHead } from '@/components/Table/TableHead'
import { TableRow } from '@/components/Table/TableRow'
import { TableCell } from '@/components/Table/TableCell'
import { TableBody } from '@/components/Table/TableBody'
import { LeftArrowIcon } from '@/components/Icons/LeftArrowIcon'

type Props = {
	data: IChange[]
}

export const Graphite: FC<Props> = ({ data }) => {
	const [selected, setSelected] = useState<number | undefined>(undefined)
	const anchor = useRef<HTMLDivElement>(null)

	const selectHandler = (idx: number) => () => {
		if (selected === idx) {
			setSelected(undefined)
		} else {
			setSelected(idx)
		}
	}
	const closeHandler = () => {
		setSelected(undefined)
	}

	return (
		<TableContainer sx={{ minHeight: 150, position: 'relative' }}>
			{!data.length ? (
				<NoRowsOverlay />
			) : (
				<Table ref={anchor}>
					<TableHead>
						<TableRow height={40} sx={{ cursor: 'default' }}>
							<TableCell width={160}>Дата изменения</TableCell>
							<TableCell width={430}>Измененные поля</TableCell>
							<TableCell width={210}>Пользователь</TableCell>
							<TableCell width={50}></TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{data.map((item, idx) => {
							const fields = item.changedFields.map(f => {
								const name = f.charAt(0).toLowerCase() + f.slice(1)
								const column = Columns.find(c => c.field === name)

								return column?.name
							})

							return (
								<TableRow key={item.id} sx={{ minHeight: 38, cursor: 'default' }}>
									<TableCell width={160}>{dayjs(item.created).format('DD.MM.YYYY HH:mm')}</TableCell>
									<TableCell width={430}>
										{/* <CellText value={fields.join(', ')} /> */}
										<Typography>{fields.join(', ')}</Typography>
										{/* <Stack
											my={0.5}
											direction={'row'}
											flexWrap={'wrap'}
											gap={0.5}
											justifyContent={'center'}
										>
											{fields.map(f => (
												<Chip key={f} variant='outlined' label={f} />
											))}
										</Stack> */}
									</TableCell>
									<TableCell width={210}>{item.userName}</TableCell>
									<TableCell width={50}>
										<IconButton onClick={selectHandler(idx)}>
											<LeftArrowIcon
												fontSize={16}
												fill={'#868686'}
												transform={'rotate(180deg)'}
											/>
										</IconButton>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			)}

			<GraphitePopover
				open={selected != undefined}
				onClose={closeHandler}
				anchor={anchor.current}
				item={data[selected || 0]}
			/>
		</TableContainer>
	)
}

type PopoverProps = {
	open: boolean
	anchor: HTMLDivElement | null
	onClose: () => void
	item: IChange
}

const GraphitePopover: FC<PopoverProps> = ({ open, anchor, onClose, item }) => {
	if (!item) return null

	const fields = item.changedFields.map(f => {
		const name = f.charAt(0).toLowerCase() + f.slice(1)
		const column = Columns.find(c => c.field === name)

		return column
	})
	const orig = JSON.parse(item.original)
	const changed = JSON.parse(item.changed)

	return (
		<Popover
			open={open}
			onClose={onClose}
			anchorEl={anchor}
			anchorOrigin={{
				vertical: 'center',
				horizontal: 'center',
			}}
			transformOrigin={{
				vertical: 'center',
				horizontal: 'center',
			}}
		>
			<Box paddingX={2} pt={1} pb={2}>
				<Table>
					<TableHead>
						<TableRow height={40} sx={{ cursor: 'default' }}>
							<TableCell width={180}>Наименование</TableCell>
							<TableCell width={260}>Предыдущее значение</TableCell>
							<TableCell width={260}>Новое значение</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{fields.map((f, idx) => (
							<TableRow key={idx} sx={{ minHeight: 38, cursor: 'default' }}>
								<TableCell width={180}>{f?.name}</TableCell>
								<TableCell width={260}>{orig?.[f?.field || '']}</TableCell>
								<TableCell width={260}>
									<Typography fontWeight={'bold'}>{changed?.[f?.field || '']}</Typography>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Box>
		</Popover>
	)
}
