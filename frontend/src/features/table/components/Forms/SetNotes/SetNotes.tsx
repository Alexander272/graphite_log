import type { FC } from 'react'
import { Button, Divider, Stack, TextField, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { ISetNotesDTO } from '@/features/table/types/item'
import { useAppDispatch } from '@/hooks/redux'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { useGetTableItemByIdQuery, useSetNotesMutation } from '@/features/table/tableApiSlice'
import { BoxFallback } from '@/components/Fallback/BoxFallback'

type Props = {
	id: string
}

const defaultValues: ISetNotesDTO = {
	id: '',
	notes: '',
}

export const SetNotes: FC<Props> = ({ id }) => {
	const dispatch = useAppDispatch()

	const [setNotes, { isLoading }] = useSetNotesMutation()
	const { data, isFetching } = useGetTableItemByIdQuery(id, { skip: !id })

	const {
		control,
		handleSubmit,
		formState: { dirtyFields },
	} = useForm<ISetNotesDTO>({
		values: { ...defaultValues, notes: data?.data.notes || '' },
	})

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'SetNotes', isOpen: false }))
	}

	const submitHandler = handleSubmit(async form => {
		console.log('save', form, dirtyFields)

		form.id = id
		form.notes = form.notes.trim()

		try {
			await setNotes(form).unwrap()
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
				<Controller
					control={control}
					name={'notes'}
					render={({ field, fieldState: { error } }) => (
						<TextField
							{...field}
							value={field.value || ''}
							label={'Изменить примечание'}
							fullWidth
							error={Boolean(error)}
							multiline
						/>
					)}
				/>

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
