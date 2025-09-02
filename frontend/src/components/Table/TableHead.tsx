import type { FC, PropsWithChildren } from 'react'

import { TableHeadContainer } from './style'

type Props = {
	scrollLeft?: number
}

export const TableHead: FC<PropsWithChildren<Props>> = ({ children, scrollLeft }) => {
	return <TableHeadContainer scrollLeft={scrollLeft}>{children}</TableHeadContainer>
}
