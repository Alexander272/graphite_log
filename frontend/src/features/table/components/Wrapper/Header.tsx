import { Button, Stack, useTheme } from '@mui/material'

import { PermRules } from '@/features/user/constants/permissions'
import { useAppDispatch } from '@/hooks/redux'
import { useCheckPermission } from '@/features/user/hooks/check'
import { changeDialogIsOpen } from '@/features/dialog/dialogSlice'
import { ActiveRealm } from '@/features/realms/components/ActiveRealm'
import { PlusIcon } from '@/components/Icons/PlusIcon'
import { CreateDialog } from '../Dialogs/Create'
import { Search } from '../Search/Search'
import { Setting } from '../Setting/SettingLazy'
import { Filters } from '../Filters/Filters'

export const Header = () => {
	const { palette } = useTheme()
	const dispatch = useAppDispatch()

	const createHandler = () => {
		dispatch(changeDialogIsOpen({ variant: 'CreateTableItem', isOpen: true }))
	}

	return (
		<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1} mb={0.5} mx={2}>
			<Stack direction={'row'} spacing={1} flexBasis={'20%'}>
				<ActiveRealm />

				{useCheckPermission(PermRules.Graphite.Write) ? (
					<Button onClick={createHandler} variant='outlined'>
						<PlusIcon fontSize={12} mr={1} fill={palette.primary.main} /> Добавить
					</Button>
				) : null}
			</Stack>

			<Search />

			<Stack direction={'row'} spacing={2} flexBasis={'20%'} justifyContent={'flex-end'}>
				<Setting />
				<Filters />
			</Stack>

			<CreateDialog />
		</Stack>
	)
}
