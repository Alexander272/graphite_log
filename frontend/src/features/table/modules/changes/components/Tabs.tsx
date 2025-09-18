import type { FC } from 'react'
import { Tab, Tabs } from '@mui/material'

import type { TabVariants } from '../types/tabs'

type Props = {
	value: TabVariants
	onChange: (value: TabVariants) => void
}

const tabs: { label: string; value: TabVariants }[] = [
	{ label: 'Позиция', value: 'graphite' },
	{ label: 'Назначение', value: 'purpose' },
	{ label: 'Место нахождения', value: 'place' },
	{ label: 'Продление', value: 'extending' },
	{ label: 'Выдача', value: 'issuance' },
]

export const ChangesTabs: FC<Props> = ({ value, onChange }) => {
	const tabHandler = (_event: React.SyntheticEvent, newValue: string) => {
		onChange(newValue as TabVariants)
	}

	return (
		<Tabs
			value={value}
			onChange={tabHandler}
			variant='scrollable'
			sx={{
				mt: 1,
				mb: 1,
				borderBottom: 1,
				borderColor: '#00000014',
				'.MuiTabs-scrollButtons': { transition: 'all .2s ease-in-out' },
				'.MuiTabs-scrollButtons.Mui-disabled': {
					height: 0,
				},
			}}
		>
			{tabs.map(tab => (
				<Tab
					key={tab.value}
					label={tab.label}
					value={tab.value}
					sx={{
						textTransform: 'inherit',
						borderRadius: 3,
						transition: 'all 0.3s ease-in-out',
						minHeight: 48,
						flexGrow: 1,
						flexShrink: 1,
						maxWidth: '100%',
						width: '100%',
						':hover': {
							backgroundColor: '#f5f5f5',
						},
					}}
				/>
			))}
		</Tabs>
	)
}
