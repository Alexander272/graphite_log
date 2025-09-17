import type { FC } from 'react'
import { SvgIcon, type SxProps, type Theme } from '@mui/material'

export const ReplyIcon: FC<SxProps<Theme>> = style => {
	return (
		<SvgIcon sx={style}>
			<svg x='0px' y='0px' viewBox='0 0 122.88 98.86' enableBackground='new 0 0 122.88 98.86' xmlSpace='preserve'>
				<path
					fillRule='evenodd'
					clipRule='evenodd'
					d='M0,49.43l48.93,49.43V74.23c30.94-6.41,55.39,0.66,73.95,24.19c-3.22-48.4-36.29-71.76-73.95-73.31V0L0,49.43 L0,49.43L0,49.43z'
				/>
			</svg>
		</SvgIcon>
	)
}
