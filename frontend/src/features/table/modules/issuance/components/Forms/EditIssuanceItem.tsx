import type { FC } from 'react'
import { Button, Stack, useTheme } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

import type { IFetchError } from '@/app/types/error'
import type { IIssuance, IIssuanceDTO } from '../../types/issuance'
import { useAppDispatch } from '@/hooks/redux'
import { useDeleteIssuanceMutation, useUpdateIssuanceMutation } from '../../issuanceApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { DeleteIcon } from '@/components/Icons/DeleteIcon'
import { Confirm } from '@/components/Confirm/Confirm'
import { Inputs as IssuanceInputs } from './IssuanceInputs'
import { Inputs as ReturnInputs } from './ReturnInputs'

type Props = {
	data: IIssuance
}

const defaultValues: IIssuanceDTO = {
	id: '',
	graphiteId: '',
	issuanceDate: dayjs().toISOString(),
	isFull: true,
	isNotFull: false,
	type: 'issuance',
	amount: 0,
}

export const EditIssuanceItem: FC<Props> = ({ data }) => {
	const dispatch = useAppDispatch()

	const { palette } = useTheme()

	const methods = useForm<IIssuanceDTO>({
		values: { ...defaultValues, ...data, isNotFull: !data.isFull },
	})

	const [update, { isLoading }] = useUpdateIssuanceMutation()
	const [remove, { isLoading: isDeleting }] = useDeleteIssuanceMutation()

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'UpdateTableItem', isOpen: false }))
	}

	const submitHandler = methods.handleSubmit(async form => {
		console.log('save', form, methods.formState.dirtyFields)

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
					{data.type == 'issuance' && <IssuanceInputs />}
					{data.type == 'return' && <ReturnInputs />}
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
