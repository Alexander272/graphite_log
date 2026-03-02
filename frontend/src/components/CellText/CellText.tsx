import { Tooltip, Typography } from '@mui/material'
import { type FC, memo, useRef, useState } from 'react'

type Props = {
	value: string
	color?: string
	align?: 'right' | 'left' | 'center' | 'inherit' | 'justify'
}

export const CellText: FC<Props> = memo(({ value, align = 'center', color }) => {
	const [isOverflow, setIsOverflow] = useState(false)
	const textRef = useRef<HTMLParagraphElement>(null)

	// Проверяем переполнение только ПРИ НАВЕДЕНИИ
	const handleMouseEnter = () => {
		const el = textRef.current
		if (el) {
			const hasOverflow = el.offsetWidth < el.scrollWidth
			if (hasOverflow !== isOverflow) {
				setIsOverflow(hasOverflow)
			}
		}
	}

	const text = (
		<Typography
			ref={textRef}
			align={align}
			onMouseEnter={handleMouseEnter} // Замеряем только когда надо
			sx={{
				fontSize: '0.85rem',
				overflow: 'hidden',
				textOverflow: 'ellipsis',
				whiteSpace: 'nowrap',
				color: color,
				padding: '6px 6px',
				display: 'block', // Важно для корректного замера ширины
			}}
		>
			{value}
		</Typography>
	)

	// Если переполнение обнаружено, оборачиваем в Tooltip
	return isOverflow ? (
		<Tooltip title={value} disableInteractive>
			{text}
		</Tooltip>
	) : (
		text
	)
})
