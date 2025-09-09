import type { ChangeEvent } from 'react'
import { InputAdornment, TextField } from '@mui/material'

import { useAppDispatch } from '@/hooks/redux'
import { useDebounceFunc } from '@/hooks/useDebounceFunc'
import { setSearch } from '../../tableSlice'
import { SearchIcon } from '@/components/Icons/SearchIcon'
import { Setting } from './Setting'

export const Search = () => {
	const dispatch = useAppDispatch()

	const searchHandler = useDebounceFunc(v => {
		dispatch(setSearch(v as string))
	}, 500)

	const changeValueHandler = (event: ChangeEvent<HTMLInputElement>) => {
		searchHandler(event.target.value)
	}

	return (
		<TextField
			name='search'
			onChange={changeValueHandler}
			slotProps={{
				input: {
					startAdornment: (
						<InputAdornment position='start'>
							<SearchIcon fontSize={16} />
						</InputAdornment>
					),
					endAdornment: (
						<InputAdornment position='end'>
							<Setting />
						</InputAdornment>
					),
				},
			}}
			placeholder='Поиск...'
			sx={{ width: 350 }}
		/>
	)
}
