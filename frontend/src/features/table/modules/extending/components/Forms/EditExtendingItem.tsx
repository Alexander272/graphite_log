import type { FC } from 'react'
import { Button, Stack, useTheme } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { IExtending, IExtendingDTO } from '../../types/extending'
import { useAppDispatch } from '@/hooks/redux'
import { useDeleteExtendingMutation, useUpdateExtendingMutation } from '../../extendingApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { Confirm } from '@/components/Confirm/Confirm'
import { DeleteIcon } from '@/components/Icons/DeleteIcon'
import { Inputs } from './Inputs'

type Props = {
	data: IExtending
}

const defaultValues: IExtendingDTO = {
	id: '',
	graphiteId: '',
	act: '',
	date: dayjs().toISOString(),
	period: 0,
}

export const EditExtending: FC<Props> = ({ data }) => {
	const dispatch = useAppDispatch()

	const { palette } = useTheme()

	const methods = useForm<IExtendingDTO>({
		values: { ...defaultValues, ...data, act: data.act.split(' от')[0] },
	})

	const [update, { isLoading }] = useUpdateExtendingMutation()
	const [remove, { isLoading: isDeleting }] = useDeleteExtendingMutation()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'UpdateTableItem', isOpen: false }))
	}

	const submitHandler = methods.handleSubmit(async form => {
		console.log('save', form, methods.formState.dirtyFields)

		form.act = form.act.trim() ? `${form.act.trim()} от ${dayjs(form.date).format('DD.MM.YYYY')}` : ''

		try {
			await update(form).unwrap()
			closeHandler()
		} catch (error) {
			toast.error((error as IFetchError).data.message, { autoClose: false })
		}
	})

	const deleteHandler = async () => {
		console.log('delete', data)
		try {
			await remove({ id: data.id, graphite: data.graphiteId }).unwrap()
			closeHandler()
		} catch (error) {
			toast.error((error as IFetchError).data.message, { autoClose: false })
		}
	}

	return (
		<Stack position={'relative'} my={2} mx={3}>
			{isLoading || isDeleting ? <BoxFallback /> : null}

			<Stack component={'form'} onSubmit={submitHandler}>
				<FormProvider {...methods}>
					<Inputs />
				</FormProvider>

				<Stack direction={'row'} justifyContent={'center'} spacing={2}>
					<Button variant='outlined' type='submit' sx={{ textTransform: 'inherit', width: 300 }}>
						Сохранить
					</Button>

					<Confirm
						onClick={deleteHandler}
						confirmText='Вы действительно хотите удалить запись?'
						buttonComponent={
							<Button color='error' sx={{ height: 37 }}>
								<DeleteIcon fontSize={18} fill={palette.error.light} />
							</Button>
						}
					/>
				</Stack>
			</Stack>
		</Stack>
	)
}
