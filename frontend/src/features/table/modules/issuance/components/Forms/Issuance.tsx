import type { FC } from 'react'
import { Button, Divider, Stack, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { IIssuanceDTO } from '../../types/issuance'
import { useAppDispatch } from '@/hooks/redux'
import { useGetTableItemByIdQuery } from '@/features/table/tableApiSlice'
import { useCreateIssuanceMutation } from '../../issuanceApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { Inputs } from './IssuanceInputs'

type Props = {
	id: string
}

const defaultValues: IIssuanceDTO = {
	id: '',
	realmId: '',
	graphiteId: '',
	issuanceDate: dayjs().toISOString(),
	isFull: true,
	isNotFull: false,
	type: 'issuance',
	amount: 0,
}

export const Issuance: FC<Props> = ({ id }) => {
	const dispatch = useAppDispatch()

	const methods = useForm<IIssuanceDTO>({
		values: defaultValues,
	})

	const [create, { isLoading }] = useCreateIssuanceMutation()
	const { data, isFetching } = useGetTableItemByIdQuery(id, { skip: !id })

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'AddIssuance', isOpen: false }))
	}

	const submitHandler = methods.handleSubmit(async form => {
		console.log('save', form, methods.formState.dirtyFields)

		form.graphiteId = id
		form.isFull = !form.isNotFull

		try {
			await create(form).unwrap()
			closeHandler()
		} catch (error) {
			toast.error((error as IFetchError).data.message, { autoClose: false })
		}
	})

	return (
		<Stack mt={-2.5} position={'relative'}>
			{isLoading || isFetching ? <BoxFallback /> : null}

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
