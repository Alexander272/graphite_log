import type { FC, MouseEvent, PropsWithChildren } from 'react'

import { TableBodyContainer } from './style'

type Props = {
	height?: string
	onContext?: (event: MouseEvent<HTMLDivElement>) => void
}

export const TableBody: FC<PropsWithChildren<Props>> = ({ children, onContext, height }) => {
	return (
		<TableBodyContainer onContextMenu={onContext} height={height}>
			{children}
		</TableBodyContainer>
	)
}
