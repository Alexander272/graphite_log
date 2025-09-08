import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'
import type { IFilter, ISearch, ISort } from './types/params'
import type { IColumn, IContextMenu } from './types/table'
import { Size } from './constants/defaultValues'
import { localKeys } from './constants/storage'
import { Columns } from './constants/columns'
import { setRealm } from '../realms/realmSlice'

interface ITableSlice {
	page: number
	size: number
	sort: ISort
	filters: IFilter[]
	search: ISearch
	// selected: ISelect
	contextMenu?: IContextMenu
	columns: IColumn[]
}

const initialState: ITableSlice = {
	page: +(localStorage.getItem(localKeys.page) || 1),
	size: +(localStorage.getItem(localKeys.size) || Size),
	sort: JSON.parse(localStorage.getItem(localKeys.sort) || '{}'),
	filters: JSON.parse(localStorage.getItem(localKeys.filter) || '[]'),
	search: {
		value: '',
		fields: ['name', 'erpName', 'supplierBatch', 'bigBagNumber', 'regNumber'],
	},
	// selected: {},
	columns: JSON.parse(localStorage.getItem(localKeys.columns) || 'null') || Columns,
}

const tableSlice = createSlice({
	name: 'table',
	initialState,
	reducers: {
		setPage: (state, action: PayloadAction<number>) => {
			state.page = action.payload
			localStorage.setItem(localKeys.page, action.payload.toString())
		},
		setSize: (state, action: PayloadAction<number>) => {
			state.size = action.payload
			localStorage.setItem(localKeys.size, action.payload.toString())
		},

		setSort: (state, action: PayloadAction<string>) => {
			if (!state.sort[action.payload]) {
				state.sort = { ...(state.sort || {}), [action.payload]: 'ASC' }
				localStorage.setItem(localKeys.sort, JSON.stringify(state.sort))
				return
			}

			if (state.sort[action.payload] == 'ASC') state.sort[action.payload] = 'DESC'
			else {
				delete state.sort[action.payload]
			}
			localStorage.setItem(localKeys.sort, JSON.stringify(state.sort))
		},

		setFilters: (state, action: PayloadAction<IFilter[]>) => {
			state.filters = action.payload
			state.page = 1
			// state.selected = {}
			localStorage.setItem(localKeys.filter, JSON.stringify(state.filters))
		},

		setSearch: (state, action: PayloadAction<string>) => {
			state.search.value = action.payload
			state.page = 1
			// state.selected = {}
		},
		setSearchFields: (state, action: PayloadAction<string[]>) => {
			state.search.fields = action.payload
		},

		// setSelected: (state, action: PayloadAction<string | string[] | undefined>) => {
		// 	if (action.payload) {
		// 		if (typeof action.payload == 'string') {
		// 			if (state.selected[action.payload]) delete state.selected[action.payload]
		// 			else state.selected[action.payload] = true
		// 		} else {
		// 			state.selected = action.payload.reduce((a, v) => ({ ...a, [v]: true }), {})
		// 		}
		// 	} else state.selected = {}
		// },

		setContextMenu: (state, action: PayloadAction<IContextMenu | undefined>) => {
			state.contextMenu = action.payload
		},

		setColumns: (state, action: PayloadAction<IColumn[]>) => {
			state.columns = action.payload
			localStorage.setItem(localKeys.columns, JSON.stringify(state.columns))
		},

		resetTable: () => {
			localStorage.removeItem(localKeys.page)
			return initialState
		},
	},
	extraReducers: builder => {
		builder.addCase(setRealm, state => {
			state.page = 1
			// state.selected = {}
		})
	},
})

export const getTablePage = (state: RootState) => state.table.page
export const getTableSize = (state: RootState) => state.table.size
export const getSort = (state: RootState) => state.table.sort
export const getFilters = (state: RootState) => state.table.filters
export const getSearch = (state: RootState) => state.table.search
// export const getSelected = (state: RootState) => state.table.selected
export const getContextMenu = (state: RootState) => state.table.contextMenu
export const getColumns = (state: RootState) => state.table.columns

export const tablePath = tableSlice.name
export const tableReducer = tableSlice.reducer

export const {
	setPage,
	setSize,
	setSort,
	setFilters,
	setSearch,
	setSearchFields,
	// setSelected,
	setContextMenu,
	setColumns,
	resetTable,
} = tableSlice.actions
