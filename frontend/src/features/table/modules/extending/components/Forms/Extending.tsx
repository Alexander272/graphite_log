import type { FC } from 'react'
import { Button, Divider, Stack, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { IExtendingDTO } from '../../types/extending'
import { useAppDispatch } from '@/hooks/redux'
import { useGetTableItemByIdQuery } from '@/features/table/tableApiSlice'
import { useCreateExtendingMutation } from '../../extendingApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { Inputs } from './Inputs'

type Props = {
	id: string
}

const defaultValues: IExtendingDTO = {
	id: '',
	graphiteId: '',
	act: '',
	date: dayjs().toISOString(),
	period: 0,
}

export const Extending: FC<Props> = ({ id }) => {
	const dispatch = useAppDispatch()

	const methods = useForm<IExtendingDTO>({
		values: defaultValues,
	})

	const [create, { isLoading }] = useCreateExtendingMutation()
	const { data, isFetching } = useGetTableItemByIdQuery(id, { skip: !id })

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'AddExtending', isOpen: false }))
	}

	const submitHandler = methods.handleSubmit(async form => {
		console.log('save', form, methods.formState.dirtyFields)

		form.graphiteId = id
		form.act = form.act.trim()

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
