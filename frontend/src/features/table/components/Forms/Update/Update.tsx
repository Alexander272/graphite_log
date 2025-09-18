import { type FC } from 'react'
import { Button, Divider, Stack } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { ITableItemDTO } from '@/features/table/types/item'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useGetTableItemByIdQuery, useUpdateTableItemMutation } from '@/features/table/tableApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { getRealm } from '@/features/realms/realmSlice'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { Inputs } from './Inputs'

const defaultValues: ITableItemDTO = {
	dateOfReceipt: dayjs().toISOString(),
	name: '',
	erpName: '',
	supplierBatch: '',
	bigBagNumber: '',
	regNumber: '',
	document: '',
	supplier: '',
	supplierName: '',
	number1c: '',
	act: '',
	productionDate: dayjs().toISOString(),
	notes: '',
}

type Props = {
	id: string
}

export const Update: FC<Props> = ({ id }) => {
	const realm = useAppSelector(getRealm)
	const dispatch = useAppDispatch()

	const { data, isFetching } = useGetTableItemByIdQuery(id || '', { skip: !id })
	const [update, { isLoading }] = useUpdateTableItemMutation()

	const methods = useForm<ITableItemDTO>({
		values: data?.data || defaultValues,
	})

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'UpdateTableItem', isOpen: false }))
	}

	const submitHandler = methods.handleSubmit(async form => {
		console.log('save', form, methods.formState.dirtyFields)
		if (!realm) return

		form.id = id
		form.realmId = realm.id
		form.name = form.name.trim()
		form.erpName = form.erpName.trim()
		form.supplierBatch = form.supplierBatch.trim()
		form.bigBagNumber = form.bigBagNumber.trim()
		form.regNumber = form.regNumber.trim()
		form.document = form.document.trim()
		form.supplier = form.supplier.trim()
		form.supplierName = form.supplierName.trim()
		form.number1c = form.number1c.trim()
		form.act = form.act.trim()
		form.notes = form.notes.trim()

		try {
			await update(form).unwrap()
			toast.success('Позиция обновлена')
			closeHandler()
		} catch (error) {
			toast.error((error as IFetchError).data.message, { autoClose: false })
		}
	})

	return (
		<Stack mt={-1.5} position={'relative'}>
			{isLoading && isFetching ? <BoxFallback /> : null}

			<Stack component={'form'} onSubmit={submitHandler}>
				<FormProvider {...methods}>
					<Inputs />
				</FormProvider>

				<Divider sx={{ width: '50%', alignSelf: 'center' }} />
				<Stack direction={'row'} spacing={3} mt={2}>
					<Button onClick={closeHandler} variant='outlined' fullWidth>
						{'Отменить'}
					</Button>
					<Button variant='contained' type='submit' fullWidth>
						{'Сохранить'}
					</Button>
				</Stack>
			</Stack>
		</Stack>
	)
}
