export type FormFields =
	| 'dateOfReceipt'
	| 'name'
	| 'erpName'
	| 'supplierBatch'
	| 'bigBagNumber'
	| 'regNumber'
	| 'document'
	| 'supplier'
	| 'supplierName'
	| 'number1c'
	| 'act'
	| 'productionDate'
	| 'notes'

type Field<T extends FormFields> = {
	name: T
	type: 'text' | 'date' | 'number' | 'bool' | 'list' | 'autocomplete'
	label: string
	isRequired?: boolean
}

export const Fields = Object.freeze<Field<FormFields>[]>([
	{
		name: 'dateOfReceipt',
		type: 'date',
		label: 'Дата поступления',
		isRequired: true,
	},
	{
		name: 'name',
		type: 'autocomplete',
		label: 'Наименование в 1С',
		isRequired: true,
	},
	{
		name: 'erpName',
		type: 'autocomplete',
		label: 'Наименование в ERP',
		isRequired: true,
	},
	{
		name: 'supplierBatch',
		type: 'autocomplete',
		label: 'Партия поставщика',
		isRequired: true,
	},
	{
		name: 'bigBagNumber',
		type: 'text',
		label: '№ б/б поставщика',
	},
	{
		name: 'regNumber',
		type: 'text',
		label: 'Регистрационный №',
		isRequired: true,
	},
	{
		name: 'document',
		type: 'autocomplete',
		label: 'Документ приобретения',
		isRequired: true,
	},
	{
		name: 'supplier',
		type: 'autocomplete',
		label: 'Поставщик',
		isRequired: true,
	},
	{
		name: 'supplierName',
		type: 'autocomplete',
		label: 'Наименование поставщика',
		isRequired: true,
	},
	{
		name: 'number1c',
		type: 'autocomplete',
		label: '№ ПО в 1С',
	},
	{
		name: 'act',
		type: 'autocomplete',
		label: '№ Акта',
	},
	{
		name: 'productionDate',
		type: 'date',
		label: 'Дата производства',
		isRequired: true,
	},
	{
		name: 'notes',
		type: 'text',
		label: 'Примечания',
	},
])
