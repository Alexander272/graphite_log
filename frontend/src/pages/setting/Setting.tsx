import { Suspense, useState, type SyntheticEvent } from 'react'
import { Box, Breadcrumbs, Tab, Tabs } from '@mui/material'

import { AppRoutes } from '../router/routes'
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb'
import { PageBox } from '@/components/PageBox/PageBox'
import { Fallback } from '@/components/Fallback/Fallback'
import { Realms } from './realms/RealmsLazy'
import { Notifications } from './notifications/NotificationsLazy'

const tabsData = [
	{ id: 'realm', name: 'Области' },
	{ id: 'notifications', name: 'Уведомления' },
]

export default function Setting() {
	const [active, setActive] = useState('realm')

	const tabHandler = (_event: SyntheticEvent, value: string) => {
		setActive(value)
	}

	return (
		<PageBox>
			<Box
				borderRadius={3}
				padding={2}
				margin={'0 auto'}
				width={{ xl: '66%', lg: '86%', md: '100%' }}
				border={'1px solid rgba(0, 0, 0, 0.12)'}
				// flexGrow={1}
				display={'flex'}
				flexDirection={'column'}
				sx={{ backgroundColor: '#fff', userSelect: 'none' }}
			>
				<Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
					<Breadcrumb to={AppRoutes.Home}>Главная</Breadcrumb>
					<Breadcrumb to={AppRoutes.Settings} active={location.pathname === AppRoutes.Settings}>
						Настройки
					</Breadcrumb>
				</Breadcrumbs>

				<Tabs
					value={active}
					onChange={tabHandler}
					sx={{
						borderBottom: 1,
						borderColor: 'divider',
						width: '100%',
						mb: 3,
						'.MuiTabs-scrollButtons': { transition: 'all .2s ease-in-out' },
						'.MuiTabs-scrollButtons.Mui-disabled': {
							height: 0,
						},
					}}
				>
					{tabsData.map(t => (
						<Tab
							key={t.id}
							label={t.name}
							value={t.id}
							sx={{
								textTransform: 'inherit',
								borderRadius: 3,
								transition: 'all 0.3s ease-in-out',
								maxWidth: '100%',
								flexGrow: 1,
								':hover': {
									backgroundColor: '#f5f5f5',
								},
							}}
						/>
					))}
				</Tabs>

				<Suspense fallback={<Fallback />}>
					{active == 'realm' && <Realms />}
					{active == 'notifications' && <Notifications />}
				</Suspense>
			</Box>
		</PageBox>
	)
}
