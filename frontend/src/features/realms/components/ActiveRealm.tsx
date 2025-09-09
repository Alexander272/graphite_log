import { type FC, useEffect } from 'react'
import { MenuItem, Select, type SelectChangeEvent, type SxProps, type Theme, useTheme } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useGetRealmsByUserQuery } from '../realmsApiSlice'
import { getRealm, setRealm } from '../realmSlice'

type Props = {
	sx?: SxProps<Theme>
}

export const ActiveRealm: FC<Props> = ({ sx }) => {
	const { palette } = useTheme()

	const realm = useAppSelector(getRealm)
	const dispatch = useAppDispatch()

	const { data, isFetching } = useGetRealmsByUserQuery(null)
	// const [choose] = useChooseRealmMutation()

	useEffect(() => {
		if (!data) return
		const founded = data.data.find(e => e.id === realm?.id)
		if (founded) return
		dispatch(setRealm(data.data[0]))
	}, [data, dispatch, realm])

	const changeHandler = async (event: SelectChangeEvent) => {
		const value = data?.data.find(e => e.id === event.target.value)
		if (!value) return

		dispatch(setRealm(value))
		// try {
		// 	const payload = await choose(value.id).unwrap()
		// 	dispatch(setRole(payload.data.role))
		// 	dispatch(setPermissions(payload.data.permissions))
		// } catch (error) {
		// 	const fetchError = error as IFetchError
		// 	toast.error(fetchError.data.message, { autoClose: false })
		// }
	}

	return (
		<Select
			value={realm?.id || ''}
			onChange={changeHandler}
			disabled={isFetching}
			sx={{
				color: palette.primary.main,
				fontSize: '1.2rem',
				boxShadow: 'none',
				'.MuiOutlinedInput-notchedOutline': { border: 0 },
				'&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
					border: 0,
				},
				'&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
					border: 0,
				},
				'.MuiOutlinedInput-input': { padding: '6.5px 10px' },
				...sx,
			}}
		>
			<MenuItem value='' disabled>
				Выберите область
			</MenuItem>
			{data?.data.map(item => (
				<MenuItem key={item.id} value={item.id}>
					{item.name}
				</MenuItem>
			))}
		</Select>
	)
}
