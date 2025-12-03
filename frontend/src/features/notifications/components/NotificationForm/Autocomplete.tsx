import { useState, type FC, type PropsWithChildren } from 'react'
import {
	Autocomplete,
	Button,
	Divider,
	MenuItem,
	Paper,
	TextField,
	useTheme,
	type ButtonProps,
	type PaperProps,
} from '@mui/material'

import type { IChannel } from '../../types/channels'
import { useAppDispatch } from '@/hooks/redux'
import { useGetChannelsQuery } from '../../channelsApiSlice'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { PlusIcon } from '@/components/Icons/PlusIcon'

type Props = {
	value: IChannel | null
	onChange: (value: IChannel | null) => void
}

export const CreatableAutocomplete: FC<Props> = ({ value, onChange }) => {
	const { data, isFetching } = useGetChannelsQuery(null)
	const [inputValue, setInputValue] = useState('')

	const dispatch = useAppDispatch()

	const openHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'AddChannel', isOpen: true, context: { value: inputValue } }))
	}

	const selectHandler = (_event: unknown, value: string | IChannel | null) => {
		if (typeof value === 'string') {
			const found = data?.data.find(channel => channel.name === value)
			if (found) onChange(found)
			return
		}
		onChange(value)
	}

	return (
		<Autocomplete
			value={value}
			onChange={selectHandler}
			inputValue={inputValue}
			onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
			options={data?.data || []}
			getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
			renderOption={(props, option) => {
				const { key, ...optionProps } = props
				return (
					<MenuItem key={key} component='li' {...optionProps}>
						{option.name}
					</MenuItem>
				)
			}}
			noOptionsText={'Ничего не найдено'}
			loading={isFetching}
			selectOnFocus
			clearOnBlur
			handleHomeEndKeys
			fullWidth
			freeSolo
			renderInput={params => <TextField {...params} label='Название канала или чата' />}
			slots={{
				paper: props => <CustomPaper containerProps={props} onCreate={openHandler} />,
			}}
		/>
	)
}

interface CustomPaperProps {
	containerProps: PaperProps
	onCreate: ButtonProps['onClick']
}

const CustomPaper: FC<PropsWithChildren<CustomPaperProps>> = ({ containerProps, onCreate }) => {
	const { palette } = useTheme()

	return (
		<Paper {...containerProps}>
			<Button
				fullWidth
				color='primary'
				onClick={onCreate} // Use onClick for the button
				// Important: Use onMouseDown and preventDefault to prevent blurring of the input
				onMouseDown={event => event.preventDefault()}
				sx={{ textTransform: 'inherit' }}
			>
				<PlusIcon fontSize={12} mr={1} fill={palette.primary.main} /> Создать
			</Button>
			<Divider />

			{containerProps.children}
		</Paper>
	)
}
