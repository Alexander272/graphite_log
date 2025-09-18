import { Fragment, useEffect, useState, type FC } from 'react'
import { Collapse, Divider, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'

import { useGetTableItemByIdQuery } from '@/features/table/tableApiSlice'
import { useGetIssuanceQuery } from '../../issuanceApiSlice'
import { NoRowsOverlay } from '@/features/table/components/NoRowsOverlay/components/NoRowsOverlay'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { LeftArrowIcon } from '@/components/Icons/LeftArrowIcon'
import { EditIssuanceItem } from './EditIssuanceItem'

type Props = {
	graphite: string
}

export const EditIssuanceList: FC<Props> = ({ graphite }) => {
	const [open, setOpen] = useState('')

	const { data, isFetching } = useGetIssuanceQuery(graphite, { skip: !graphite })
	const { data: item, isFetching: isFetchingItem } = useGetTableItemByIdQuery(graphite, { skip: !graphite })

	useEffect(() => {
		if (data && data.data.length) setOpen(data.data[0].id)
	}, [data])

	const openHandler = (id: string) => () => {
		setOpen(id)
	}

	if (!data?.data.length)
		return (
			<Stack height={150} position={'relative'}>
				<NoRowsOverlay />
			</Stack>
		)
	return (
		<>
			{isFetchingItem || isFetching ? <BoxFallback /> : null}

			<Stack mb={1}>
				<Typography fontSize={'1.1rem'} textAlign={'center'}>
					{item?.data.name}
				</Typography>
				<Typography textAlign={'center'}>
					{item?.data.regNumber ? `Регистрационный №: ${item?.data.regNumber}` : null}
				</Typography>
			</Stack>

			<List>
				{data?.data.map(e => {
					let title = e.type == 'return' ? 'Возвращен' : 'Выдан'
					if (e.amount) title += `о ${e.amount} кг`

					return (
						<Fragment key={e.id}>
							<ListItemButton
								onClick={openHandler(e.id)}
								selected={open === e.id}
								sx={{ borderRadius: 3 }}
							>
								<ListItemText primary={title} />
								<LeftArrowIcon
									fontSize={16}
									transform={open === e.id ? 'rotate(90deg)' : 'rotate(270deg)'}
								/>
							</ListItemButton>
							<Collapse in={open === e.id} timeout='auto'>
								<EditIssuanceItem data={e} />
							</Collapse>
							<Divider sx={{ width: '80%', mx: 'auto' }} />
						</Fragment>
					)
				})}
			</List>
		</>
	)
}
