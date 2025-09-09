import { useRef, useState } from 'react'
import { Checkbox, FormControlLabel, IconButton, Stack, useTheme } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'

import { Columns } from '../../constants/columns'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getSearch, setSearchFields } from '../../tableSlice'
import { Popover } from '@/components/Popover/Popover'
import { SettingIcon } from '@/components/Icons/SettingIcon'

type FieldList = {
	[x: string]: boolean
}

const columns = Columns.filter(c => c.allowSearch)

export const Setting = () => {
	const [open, setOpen] = useState(false)
	const anchor = useRef(null)

	const { palette } = useTheme()

	const { fields } = useAppSelector(getSearch)
	const dispatch = useAppDispatch()

	const methods = useForm<FieldList>({ defaultValues: fields?.reduce((a, v) => ({ ...a, [v]: true }), {}) })

	const toggleHandler = () => setOpen(prev => !prev)

	const mouseDownSettingHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault()
	}

	const saveHandler = (form: FieldList) => {
		console.log('search filed form', form)
		const values = Object.keys(form).reduce((ac: string[], k) => {
			if (form[k]) ac.push(k)
			return ac
		}, [])
		dispatch(setSearchFields(values))
		toggleHandler()
	}

	const closeHandler = () => {
		methods.handleSubmit(saveHandler)()
	}

	return (
		<>
			<IconButton ref={anchor} onClick={toggleHandler} onMouseDown={mouseDownSettingHandler} edge='end'>
				<SettingIcon fontSize={20} fill={'#505050'} />
			</IconButton>

			<Popover open={open} onClose={closeHandler} anchorEl={anchor.current} paperSx={{ padding: 0 }}>
				<FormProvider {...methods}>
					<Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto', userSelect: 'none', pr: 1, ml: 1 }}>
						{columns.map(c => (
							<Controller
								key={c.field}
								control={methods.control}
								name={c.field}
								render={({ field }) => (
									<FormControlLabel
										label={c.name}
										control={<Checkbox checked={field.value || false} />}
										onChange={field.onChange}
										sx={{
											transition: 'all 0.3s ease-in-out',
											borderRadius: 3,
											pl: 0.5,
											':hover': { backgroundColor: palette.action.hover },
										}}
									/>
								)}
							/>
						))}
					</Stack>
				</FormProvider>
			</Popover>
		</>
	)
}
