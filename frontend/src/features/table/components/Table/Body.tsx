import { useEffect, useState, type FC } from 'react'
import { FixedSizeList } from 'react-window'

import { MaxSize, RowHeight, Size } from '../../constants/defaultValues'
import { useAppSelector } from '@/hooks/redux'
import { useGetTableItems } from '../../hooks/getTableItems'
import { useCalcWidth } from '../../utils/calcWidth'
import { getColumns, getTableSize } from '../../tableSlice'
import { TableBody } from '@/components/Table/TableBody'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { NoRowsOverlay } from '../NoRowsOverlay/components/NoRowsOverlay'
import { Row } from './Row'

type Props = unknown

export const Body: FC<Props> = () => {
	const size = useAppSelector(getTableSize)
	const columns = useAppSelector(getColumns)

	const [maxSize, setMaxSize] = useState(MaxSize)

	const { data, isFetching, isLoading } = useGetTableItems()

	const { width } = useCalcWidth(columns || [])

	useEffect(() => {
		if (!isFetching && window.innerHeight > 1000) {
			setMaxSize(Math.floor((window.innerHeight - 250) / RowHeight) - 1 || MaxSize)
		}
	}, [isFetching, size])

	if (!isLoading && !data?.total) return <NoRowsOverlay />
	return (
		<TableBody>
			{isFetching || isLoading ? <BoxFallback /> : null}

			{data && (
				<FixedSizeList
					overscanCount={10}
					height={RowHeight * (size > Size ? maxSize : Size)}
					itemCount={data.data.length > (size || Size) ? size || Size : data.data.length}
					itemSize={RowHeight}
					width={width}
				>
					{({ index, style }) => <Row item={data.data[index]} sx={style} />}
				</FixedSizeList>
			)}
		</TableBody>
	)
}
