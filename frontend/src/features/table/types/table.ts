export interface IHeadColumn {
	key: string
	label: string
	width?: number
	align?: 'center' | 'right' | 'left'
	allowsSorting?: boolean
	children?: IHeadColumn[]
}

export type ColumnTypes = 'text' | 'number' | 'date' | 'file' | 'list' | 'autocomplete' | 'parent'

export interface IColumn {
	id: string
	name: string
	field: string
	position?: number
	type: ColumnTypes
	width?: number
	parentId?: string
	allowSort?: boolean
	allowFilter?: boolean
	hidden?: boolean
	children?: IColumn[]

	// key: string
	// label: string
	// width?: number
	// align?: 'center' | 'right' | 'left'
	// isShow?: boolean
	// allowSearch?: boolean
	// formatter?: (value: unknown) => string
}

export interface IContextMenu {
	active: string
	coords: ICoordinates
}

export interface ICoordinates {
	mouseX: number
	mouseY: number
}

export interface ISelect {
	[id: string]: boolean
}
