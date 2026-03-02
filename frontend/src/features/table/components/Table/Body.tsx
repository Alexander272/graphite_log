import { useCallback, useEffect, useMemo, useState, type FC } from 'react'
import { FixedSizeList, type ListChildComponentProps } from 'react-window'

import { MaxSize, RowHeight, Size } from '../../constants/defaultValues'
import { useAppSelector } from '@/hooks/redux'
import { useGetTableItems } from '../../hooks/getTableItems'
import { useCalcWidth } from '../../utils/calcWidth'
import { getColumns, getTableSize } from '../../tableSlice'
import { TableBody } from '@/components/Table/TableBody'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { NoRowsOverlay } from '../NoRowsOverlay/components/NoRowsOverlay'
import { Row } from './Row'

export const Body: FC = () => {
	const size = useAppSelector(getTableSize)
	const columns = useAppSelector(getColumns)

	const [maxSize, setMaxSize] = useState(MaxSize)

	const { data, isFetching, isLoading } = useGetTableItems()
	const { width } = useCalcWidth(columns || [])

	const listHeight = useMemo(() => {
		const effectiveSize = size > Size ? maxSize : Size
		return RowHeight * effectiveSize
	}, [size, maxSize])

	const itemCount = useMemo(() => {
		if (!data?.data) return 0
		const limit = size || Size
		return data.data.length > limit ? limit : data.data.length
	}, [data?.data, size])

	const renderRow = useCallback(
		({ index, style }: ListChildComponentProps) => {
			const item = data?.data[index]
			if (!item) return null
			return <Row item={item} sx={style} />
		},
		[data?.data],
	)

	useEffect(() => {
		const handleResize = () => {
			if (window.innerHeight > 1000) {
				const calculated = Math.floor((window.innerHeight - 250) / RowHeight) - 1
				setMaxSize(calculated > 0 ? calculated : MaxSize)
			}
		}

		handleResize() // Вызов при монтировании
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	if (!isLoading && !data?.total) return <NoRowsOverlay />

	return (
		<TableBody>
			{(isFetching || isLoading) && <BoxFallback />}

			{data && (
				<FixedSizeList
					overscanCount={5}
					height={listHeight}
					itemCount={itemCount}
					itemSize={RowHeight}
					width={width}
					itemData={data.data}
				>
					{renderRow}
				</FixedSizeList>
			)}
		</TableBody>
	)
}
