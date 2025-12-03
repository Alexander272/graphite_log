import { AppBar, Box, Stack, Toolbar } from '@mui/material'
import { Link } from 'react-router'

import { AppRoutes } from '@/pages/router/routes'
import { useAppSelector } from '@/hooks/redux'
import { useSignOutMutation } from '@/features/auth/authApiSlice'
import { getToken } from '@/features/user/userSlice'
// import { GeometryIcon } from '../Icons/GeometryIcon'
import { NavButton, NavLink } from './header.style'

import logo from '@/assets/logo.webp'
import { PenIcon } from '../Icons/PenIcon'
import { useCheckPermission } from '@/features/user/hooks/check'
import { PermRules } from '@/features/user/constants/permissions'

export const LayoutHeader = () => {
	const [signOut] = useSignOutMutation()

	const token = useAppSelector(getToken)

	const showImport = useCheckPermission(PermRules.Import.Write)
	const showSetting = useCheckPermission(PermRules.Realms.Write)

	const signOutHandler = () => {
		void signOut(null)
	}

	return (
		<AppBar sx={{ borderRadius: 0 }}>
			<Toolbar sx={{ justifyContent: 'space-between', alignItems: 'inherit' }}>
				<Box alignSelf={'center'} display={'flex'} alignItems={'center'} component={Link} to={AppRoutes.Home}>
					<img height={46} width={157} src={logo} alt='logo' />
					<PenIcon fontSize={'26px'} fill={'#042245'} />
					{/* <GeometryIcon fill={'#042245'} /> */}
				</Box>

				{token && (
					<Stack direction={'row'} spacing={3} minHeight={'100%'}>
						{showImport && <NavLink to={AppRoutes.Import}>Импорт</NavLink>}
						{showSetting && <NavLink to={AppRoutes.Settings}>Настройки</NavLink>}
						<NavButton onClick={signOutHandler}>Выйти</NavButton>
					</Stack>
				)}
			</Toolbar>
		</AppBar>
	)
}
