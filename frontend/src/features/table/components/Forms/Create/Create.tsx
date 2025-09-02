import { useEffect, type FC } from 'react'
import { Button, Divider, Stack } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { ITableItemDTO } from '@/features/table/types/item'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useCreateTableItemMutation } from '@/features/table/tableApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { getRealm } from '@/features/realms/realmSlice'
import { Inputs } from './Inputs'
import { localKeys } from '@/features/table/constants/storage'
import { BoxFallback } from '@/components/Fallback/BoxFallback'

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
	reset: boolean
}

export const Create: FC<Props> = ({ reset }) => {
	const realm = useAppSelector(getRealm)
	const dispatch = useAppDispatch()

	const [create, { isLoading }] = useCreateTableItemMutation()

	const methods = useForm<ITableItemDTO>({
		values: JSON.parse(localStorage.getItem(localKeys.form) || 'null') || defaultValues,
	})

	useEffect(() => {
		if (!reset) return
		methods.reset(defaultValues)
	}, [methods, reset])

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'CreateTableItem', isOpen: false }))
	}

	const submitHandler = methods.handleSubmit(async form => {
		console.log('save', form, methods.formState.dirtyFields)
		if (!realm) return

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
			await create(form).unwrap()
			methods.reset(defaultValues)
		} catch (error) {
			toast.error((error as IFetchError).data.message, { autoClose: false })
		}
	})

	return (
		<Stack mt={-1.5} position={'relative'}>
			{isLoading && <BoxFallback />}

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
