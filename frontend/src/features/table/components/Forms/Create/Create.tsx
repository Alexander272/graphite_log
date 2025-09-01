import type { FC } from 'react'
import { Button, Divider, Stack } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'

import type { ITableItemDTO } from '@/features/table/types/item'
import { useAppDispatch } from '@/hooks/redux'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { Inputs } from './Inputs'
import dayjs from 'dayjs'

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

export const Create: FC = () => {
	const dispatch = useAppDispatch()

	const methods = useForm<ITableItemDTO>({
		values: defaultValues,
	})

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'CreateTableItem', isOpen: false }))
	}

	const submitHandler = methods.handleSubmit(async form => {
		console.log('save', form, methods.formState.dirtyFields)
	})

	return (
		<Stack mt={-1.5} position={'relative'}>
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
