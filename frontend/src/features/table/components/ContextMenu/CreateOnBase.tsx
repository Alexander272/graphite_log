import type { FC } from 'react'
import { CircularProgress, ListItemIcon, MenuItem } from '@mui/material'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useLazyGetTableItemByIdQuery } from '../../tableApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { getContextMenu, setContextMenu } from '../../tableSlice'
import { CopyIcon } from '@/components/Icons/CopyIcon'
import type { ITableItemDTO } from '../../types/item'
import { localKeys } from '../../constants/storage'

export const CreateOnBase: FC = () => {
	const contextMenu = useAppSelector(getContextMenu)
	const dispatch = useAppDispatch()

	const [get, { isFetching }] = useLazyGetTableItemByIdQuery()

	const createHandler = async () => {
		if (!contextMenu?.active) return

		try {
			const data = await get(contextMenu?.active).unwrap()
			const base: ITableItemDTO = {
				dateOfReceipt: data.data.dateOfReceipt,
				name: data.data.name,
				erpName: data.data.erpName,
				supplierBatch: data.data.supplierBatch,
				bigBagNumber: data.data.bigBagNumber,
				regNumber: data.data.regNumber,
				document: data.data.document,
				supplier: data.data.supplier,
				supplierName: data.data.supplierName,
				number1c: data.data.number1c,
				act: data.data.act,
				productionDate: data.data.productionDate,
				notes: '',
			}
			localStorage.setItem(localKeys.form, JSON.stringify(base))
			dispatch(changeDialogIsOpen({ variant: 'CreateTableItem', isOpen: true }))
			dispatch(setContextMenu())
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	}

	return (
		<MenuItem onClick={createHandler}>
			<ListItemIcon>
				{isFetching ? <CircularProgress size={18} /> : <CopyIcon fontSize={18} fill={'#363636'} />}
			</ListItemIcon>
			Создать на основании
		</MenuItem>
	)
}
