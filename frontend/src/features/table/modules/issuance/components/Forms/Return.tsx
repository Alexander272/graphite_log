import type { FC } from 'react'
import { Button, Divider, Stack, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { IReturnDTO } from '../../types/issuance'
import { useAppDispatch } from '@/hooks/redux'
import { useGetTableItemByIdQuery } from '@/features/table/tableApiSlice'
import { useCreateReturnMutation, useGetLastIssuanceQuery } from '../../issuanceApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { Inputs } from './ReturnInputs'

type Props = {
	id: string
}

const defaultValues: IReturnDTO = {
	id: '',
	graphiteId: '',
	issuanceDate: dayjs().toISOString(),
	isFull: true,
	amount: 0,
	type: 'return',
	place: '',
}

export const Return: FC<Props> = ({ id }) => {
	const dispatch = useAppDispatch()

	const [create, { isLoading }] = useCreateReturnMutation()
	const { data, isFetching } = useGetTableItemByIdQuery(id, { skip: !id })
	const { data: last, isFetching: isFetchingLast } = useGetLastIssuanceQuery(id, { skip: !id })

	const methods = useForm<IReturnDTO>({
		values: { ...defaultValues, amount: last?.data.amount || 0 },
	})

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'Return', isOpen: false }))
	}

	const submitHandler = methods.handleSubmit(async form => {
		console.log('save', form, methods.formState.dirtyFields)

		form.graphiteId = id
		form.place = form.place.trim()

		try {
			await create(form).unwrap()
			closeHandler()
		} catch (error) {
			toast.error((error as IFetchError).data.message, { autoClose: false })
		}
	})

	if (last?.data.type == 'return' && last.data.isFull)
		return (
			<Typography textAlign={'center'}>
				Возврат уже был сделан в {dayjs(last.data.issuanceDate).format('DD.MM.YYYY')}
			</Typography>
		)

	return (
		<Stack mt={-2.5} position={'relative'}>
			{isLoading || isFetching || isFetchingLast ? <BoxFallback /> : null}

			<Stack mb={3}>
				<Typography fontSize={'1.4rem'} textAlign={'center'}>
					{data?.data.name}
				</Typography>
				<Typography textAlign={'center'}>
					{data?.data.regNumber ? `Регистрационный №: ${data?.data.regNumber}` : null}
				</Typography>
			</Stack>

			<Stack component={'form'} onSubmit={submitHandler}>
				<FormProvider {...methods}>
					<Inputs />
				</FormProvider>

				<Divider sx={{ width: '50%', alignSelf: 'center', mt: 3 }} />
				<Stack direction={'row'} spacing={3} mt={3}>
					<Button onClick={closeHandler} variant='outlined' fullWidth>
						Отменить
					</Button>
					<Button variant='contained' type='submit' fullWidth>
						Сохранить
					</Button>
				</Stack>
			</Stack>
		</Stack>
	)
}
