import type { FC } from 'react'
import { Autocomplete, Button, Divider, Stack, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { ISetPlaceDTO } from '@/features/table/types/item'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useGetUniqueDataQuery, useSetPlaceMutation } from '@/features/table/tableApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { getRealm } from '@/features/realms/realmSlice'
import { BoxFallback } from '@/components/Fallback/BoxFallback'

type Props = {
	id: string
}

const defaultValues: ISetPlaceDTO = {
	id: '',
	place: '',
}

export const SetPlace: FC<Props> = ({ id }) => {
	const realm = useAppSelector(getRealm)
	const dispatch = useAppDispatch()

	const { data, isFetching } = useGetUniqueDataQuery({ field: 'place', realm: realm?.id || '' }, { skip: !realm?.id })
	const [setPlace, { isLoading }] = useSetPlaceMutation()

	const {
		control,
		handleSubmit,
		formState: { dirtyFields },
	} = useForm<ISetPlaceDTO>({
		values: defaultValues,
	})

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'SetPlace', isOpen: false }))
	}

	const submitHandler = handleSubmit(async form => {
		console.log('save', form, dirtyFields)

		form.id = id
		form.place = form.place.trim()

		try {
			await setPlace(form).unwrap()
			closeHandler()
		} catch (error) {
			toast.error((error as IFetchError).data.message, { autoClose: false })
		}
	})

	return (
		<Stack mt={-1.5} position={'relative'}>
			{isLoading ? <BoxFallback /> : null}

			<Stack component={'form'} onSubmit={submitHandler}>
				<Controller
					name={'place'}
					control={control}
					rules={{ required: true }}
					render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
						<Autocomplete
							value={value || ''}
							freeSolo
							disableClearable
							autoComplete
							options={data?.data || []}
							loading={isFetching}
							loadingText='Поиск похожих значений...'
							noOptionsText='Ничего не найдено'
							onChange={(_event, value) => {
								onChange(value)
							}}
							renderInput={params => (
								<TextField
									{...params}
									label={'Место нахождения'}
									onChange={onChange}
									fullWidth
									multiline
									error={Boolean(error)}
									helperText={error?.message}
									inputRef={ref}
								/>
							)}
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
