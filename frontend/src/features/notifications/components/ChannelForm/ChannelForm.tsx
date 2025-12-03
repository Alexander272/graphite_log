import type { FC } from 'react'
import { Button, Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import type { IFetchError } from '@/app/types/error'
import type { IChannelDTO } from '../../types/channels'
import { useCreateChannelMutation, useUpdateChannelMutation } from '../../channelsApiSlice'
import { Fallback } from '@/components/Fallback/Fallback'

type Props = {
	defData?: { id?: string; value: string; type?: 'person' | 'channel'; channelId?: string }
	onCancel: () => void
	onClose?: () => void
}

export const ChannelForm: FC<Props> = ({ defData, onCancel, onClose }) => {
	const [create, { isLoading }] = useCreateChannelMutation()
	const [update, { isLoading: isUpdating }] = useUpdateChannelMutation()

	const { control, handleSubmit } = useForm<IChannelDTO>({
		values: {
			id: defData?.id || '',
			name: defData?.value || '',
			type: defData?.type || 'person',
			channelId: defData?.channelId || '',
		},
	})

	const saveHandler = handleSubmit(async form => {
		console.log('save', form)

		try {
			if (defData?.channelId) {
				await update(form).unwrap()
			} else {
				await create(form).unwrap()
			}
			if (onClose) onClose()
		} catch (error) {
			const fetchError = error as IFetchError
			toast.error(fetchError.data.message, { autoClose: false })
		}
	})

	return (
		<Stack component={'form'} position={'relative'} mt={-2} onSubmit={saveHandler}>
			{isLoading || isUpdating ? (
				<Fallback position={'absolute'} zIndex={5} background={'#f5f5f557'} alignItems={'flex-start'} />
			) : null}

			<Stack spacing={2} mb={2}>
				<Controller
					control={control}
					name='name'
					rules={{ required: true }}
					render={({ field, fieldState: { error } }) => (
						<TextField {...field} label='Название' error={Boolean(error)} />
					)}
				/>

				<FormControl fullWidth>
					<InputLabel id='type'>Тип</InputLabel>
					<Controller
						control={control}
						name='type'
						rules={{ required: true }}
						render={({ field, fieldState: { error } }) => (
							<Select labelId='type' {...field} label={'Тип'} error={Boolean(error)}>
								<MenuItem value='person'>Отправка в ЛС</MenuItem>
								<MenuItem value='channel'>Отправка в канал</MenuItem>
							</Select>
						)}
					/>
				</FormControl>

				<Controller
					control={control}
					name='channelId'
					rules={{ required: true }}
					render={({ field, fieldState: { error } }) => (
						<TextField {...field} label='Id пользователя / канала' error={Boolean(error)} />
					)}
				/>
			</Stack>

			<Divider sx={{ width: '50%', alignSelf: 'center' }} />
			<Stack spacing={2} direction={'row'} mt={2}>
				<Button type='submit' variant='contained' fullWidth>
					Сохранить
				</Button>
				<Button onClick={onCancel} variant='outlined' fullWidth>
					Отмена
				</Button>
			</Stack>
		</Stack>
	)
}
