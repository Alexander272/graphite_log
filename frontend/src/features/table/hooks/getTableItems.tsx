import { useAppSelector } from '@/hooks/redux'
import { getRealm } from '@/features/realms/realmSlice'
import { getFilters, getSearch, getSort, getTablePage, getTableSize } from '../tableSlice'
import { useGetTableItemsQuery } from '../tableApiSlice'

export const useGetTableItems = () => {
	const realm = useAppSelector(getRealm)
	const page = useAppSelector(getTablePage)
	const size = useAppSelector(getTableSize)

	const search = useAppSelector(getSearch)
	const sort = useAppSelector(getSort)
	const filters = useAppSelector(getFilters)

	const query = useGetTableItemsQuery(
		{ realmId: realm?.id || '', page, size, sort, filters, search },
		{ skip: !realm?.id, pollingInterval: 5 * 60000, skipPollingIfUnfocused: true /*refetchOnFocus: true*/ }
	)

	return query
}
