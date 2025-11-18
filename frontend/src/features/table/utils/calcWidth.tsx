import type { IColumn } from '../types/table'
import { ColWidth } from '../constants/defaultValues'

export const useCalcWidth = (data: readonly IColumn[]) => {
	let hasFewRows = false
	const width = data.reduce((ac, cur) => {
		if (cur.children && !cur?.hidden) {
			hasFewRows = true
			return ac + cur.children.reduce((ac, cur) => ac + (cur.hidden ? 0 : cur.width || ColWidth), 0)
		}
		return ac + (cur.hidden ? 0 : cur.width || ColWidth)
	}, 14)

	return { width, hasFewRows }
}
