import { createBrowserRouter, type RouteObject } from 'react-router'

import { AppRoutes } from './routes'
import { Layout } from '@/components/Layout/Layout'
import { NotFound } from '@/pages/notFound/NotFoundLazy'
import { Auth } from '@/pages/auth/AuthLazy'
import { Home } from '@/pages/home/HomeLazy'
import { Import } from '@/pages/import/ImportLazy'
// import { Realms } from '@/pages/realms/RealmsLazy'
import { Setting } from '@/pages/setting/SettingLazy'
import PrivateRoute from './PrivateRoute'

const config: RouteObject[] = [
	{
		element: <Layout />,
		errorElement: <NotFound />,
		children: [
			{
				path: AppRoutes.Auth,
				element: <Auth />,
			},
			{
				path: AppRoutes.Home,
				element: <PrivateRoute />,
				children: [
					{
						index: true,
						element: <Home />,
					},
					{
						path: AppRoutes.Import,
						element: <Import />,
					},
					// {
					// 	path: AppRoutes.Realms,
					// 	element: <Realms />,
					// },
					{
						path: AppRoutes.Settings,
						element: <Setting />,
					},
				],
			},
		],
	},
]

export const router = createBrowserRouter(config)
