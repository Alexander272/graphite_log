import { memo, type FC } from 'react'
import { Box, Checkbox, CircularProgress } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useLazyGetTableItemsQuery } from '../../tableApiSlice'
import { getRealm } from '@/features/realms/realmSlice'
import { getFilters, getSearch, getSelected, getSort, selectAll } from '../../tableSlice'
import { useGetTableItems } from '../../hooks/getTableItems'

export const HeaderCheckbox: FC = memo(() => {
	const dispatch = useAppDispatch()
	const allSelected = useAppSelector(state => state.table.allSelected)
	const selected = useAppSelector(getSelected)
	const realm = useAppSelector(getRealm)
	const sort = useAppSelector(getSort)
	const search = useAppSelector(getSearch)
	const filters = useAppSelector(getFilters)

	const [fetchItems, { isFetching }] = useLazyGetTableItemsQuery()
	const { data } = useGetTableItems()

	const count = Object.keys(selected).length
	const isChecked = allSelected || (count > 0 && count === (data?.total || 0))
	const isIndeterminate = count > 0 && !isChecked

	const fetching = async () => {
		try {
			const params = {
				page: 1,
				realmId: realm?.id || '',
				size: 100000,
				filters,
				sort,
				search,
			}

			const payload = await fetchItems(params).unwrap()
			dispatch(selectAll(payload.data))
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message || 'Ошибка загрузки', { autoClose: false })
		}
	}

	const handleAllClick = () => {
		if (isChecked || isIndeterminate) {
			dispatch(selectAll([]))
		} else {
			fetching()
		}
	}

	if (isFetching)
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', width: 42 }}>
				<CircularProgress size={20} />
			</Box>
		)

	return <Checkbox checked={isChecked} indeterminate={isIndeterminate} onChange={handleAllClick} size='small' />
})
