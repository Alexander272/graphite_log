import { useRef, type FC } from 'react'
import { List, type ListImperativeAPI } from 'react-window'

import { MaxSize, RowHeight, Size } from '../../constants/defaultValues'
import { useAppSelector } from '@/hooks/redux'
import { useGetTableItems } from '../../hooks/getTableItems'
import { getTableSize } from '../../tableSlice'
import { TableBody } from '@/components/Table/TableBody'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { NoRowsOverlay } from '../NoRowsOverlay/components/NoRowsOverlay'
import { Row } from './Row'

type Props = unknown

export const Body: FC<Props> = () => {
	const listRef = useRef<ListImperativeAPI>(null)
	const size = useAppSelector(getTableSize)

	const { data, isFetching, isLoading } = useGetTableItems()

	if (!isLoading && !data?.total) return <NoRowsOverlay />
	return (
		<TableBody height={RowHeight * (size > Size ? MaxSize : Size) + 'px'}>
			{isFetching || isLoading ? <BoxFallback /> : null}

			{/* //TODO строка выделяется не полностью */}
			{data && (
				<List
					listRef={listRef}
					overscanCount={10}
					rowHeight={RowHeight}
					rowCount={data.data.length > (size || Size) ? size || Size : data.data.length}
					rowComponent={Row}
					rowProps={{ data: data.data || [] }}
					// style={{ overflow: 'initial' }}
				/>
			)}
		</TableBody>
	)
}
