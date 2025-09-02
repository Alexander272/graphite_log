import type { FC } from 'react'
import { Autocomplete, Button, Divider, Stack, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import type { ISetPurposeDTO } from '@/features/table/types/item'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { useGetUniqueDataQuery, useSetPurposeMutation } from '@/features/table/tableApiSlice'
import { getRealm } from '@/features/realms/realmSlice'
import { toast } from 'react-toastify'
import type { IFetchError } from '@/app/types/error'
import { BoxFallback } from '@/components/Fallback/BoxFallback'

type Props = {
	id: string
}

const defaultValues: ISetPurposeDTO = {
	id: '',
	purpose: '',
}

export const SetPurpose: FC<Props> = ({ id }) => {
	const realm = useAppSelector(getRealm)
	const dispatch = useAppDispatch()

	const { data, isFetching } = useGetUniqueDataQuery(
		{ field: 'purpose', realm: realm?.id || '' },
		{ skip: !realm?.id }
	)
	const [setPurpose, { isLoading }] = useSetPurposeMutation()

	const {
		control,
		handleSubmit,
		formState: { dirtyFields },
	} = useForm<ISetPurposeDTO>({
		values: defaultValues,
	})

	const closeHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'SetPurpose', isOpen: false }))
	}

	const submitHandler = handleSubmit(async form => {
		console.log('save', form, dirtyFields)

		form.id = id
		form.purpose = form.purpose.trim()

		try {
			await setPurpose(form).unwrap()
			closeHandler()
		} catch (error) {
			toast.error((error as IFetchError).data.message, { autoClose: false })
		}
	})

	return (
		<Stack mt={-1.5} position={'relative'}>
			{isLoading ? <BoxFallback /> : null}

			<Stack component={'form'} onSubmit={submitHandler}>
				{/* <Controller
					control={control}
					name={'purpose'}
					rules={{ required: true }}
					render={({ field, fieldState: { error } }) => (
						<TextField
							{...field}
							value={field.value || ''}
							label={'Назначение ИГ'}
							fullWidth
							error={Boolean(error)}
							multiline
						/>
					)}
				/> */}
				<Controller
					name={'purpose'}
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
									label={'Назначение ИГ'}
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
