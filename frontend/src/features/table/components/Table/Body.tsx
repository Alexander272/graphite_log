import { List } from 'react-window'

import type { ITableItem } from '../../types/item'
import { MaxSize, RowHeight, Size } from '../../constants/defaultValues'
import { useAppSelector } from '@/hooks/redux'
import { TableBody } from '@/components/Table/TableBody'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { getTableSize } from '../../tableSlice'
import { NoRowsOverlay } from '../NoRowsOverlay/components/NoRowsOverlay'
import { Row } from './Row'

export const Body = () => {
	// const section = useAppSelector(getSection)
	const size = useAppSelector(getTableSize)

	// const { data, isFetching, isLoading } = useGetSI()
	const data = { data: [], total: 0 } as { data: ITableItem[]; total: number }
	const isFetching = false
	const isLoading = false

	// const { width } = useCalcWidth(Columns)

	if (!isLoading && !data?.total) return <NoRowsOverlay />
	return (
		<TableBody>
			{isFetching || isLoading ? <BoxFallback /> : null}

			{data && (
				<List
					overscanCount={10}
					rowHeight={RowHeight * (size > Size ? MaxSize : Size)}
					rowCount={data.data.length > (size || Size) ? size || Size : data.data.length}
					// itemSize={RowHeight}
					// width={width}
					rowComponent={Row}
					// rowComponent={({ index, style, data }) => <Row index={index} style={style} data={data} />}
					rowProps={{ data: data.data || [] }}
				/>
				// 	{({ index, style }) => <Row item={data.data[index]} sx={style} />}
				// </List>
			)}
		</TableBody>
	)
}
