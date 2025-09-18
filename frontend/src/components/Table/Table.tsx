import { type CSSProperties, type FC, type PropsWithChildren } from 'react'

import { TableContainer } from './style'

type Props = {
	sx?: CSSProperties
	ref?: React.ForwardedRef<HTMLDivElement>
}

export const Table: FC<PropsWithChildren<Props>> = ({ children, ref, sx }) => {
	return (
		<TableContainer styles={sx} ref={ref}>
			{children}
		</TableContainer>
	)
}
