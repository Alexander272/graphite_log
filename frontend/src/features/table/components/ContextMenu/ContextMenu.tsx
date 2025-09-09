import { ListItemIcon, Menu, MenuItem } from '@mui/material'

import { PermRules } from '@/features/user/constants/permissions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useCheckPermission } from '@/features/user/hooks/check'
import { useGetTableItemByIdQuery } from '../../tableApiSlice'
import { changeDialogIsOpen, type DialogVariants } from '@/features/dialog/dialogSlice'
import { getContextMenu, setContextMenu } from '../../tableSlice'
import { ClockIcon } from '@/components/Icons/ClockIcon'
import { EditDocIcon } from '@/components/Icons/EditDoc'
import { ExchangeIcon } from '@/components/Icons/ExchangeIcon'
import { OperationIcon } from '@/components/Icons/OperationIcon'
import { IntegrationIcon } from '@/components/Icons/IntegrationIcon'
import { ExtendingDialog } from '../../modules/extending/components/Dialog/Extending'
import { IssuanceDialog } from '../../modules/issuance/components/Dialog/Issuance'
import { SetPurposeDialog } from '../Dialogs/SetPurpose'
import { SetPlaceDialog } from '../Dialogs/SetPlace'
import { SetNotesDialog } from '../Dialogs/SetNotes'
import { CreateOnBase } from './CreateOnBase'

export const ContextMenu = () => {
	const contextMenu = useAppSelector(getContextMenu)
	const dispatch = useAppDispatch()

	const { data } = useGetTableItemByIdQuery(contextMenu?.active || '', { skip: !contextMenu?.active })

	const closeHandler = () => {
		dispatch(setContextMenu())
	}

	const contextHandler = (variant: DialogVariants) => () => {
		dispatch(changeDialogIsOpen({ variant, isOpen: true, context: contextMenu?.active }))
		closeHandler()
	}

	const create = [<CreateOnBase key={'CreateOnBase'} />]

	const purpose = [
		<MenuItem key={'SetPurpose'} onClick={contextHandler('SetPurpose')} disabled={data?.data.isIssued}>
			<ListItemIcon>
				<OperationIcon fontSize={20} fill={'#363636'} />
			</ListItemIcon>
			Задать назначение
		</MenuItem>,
	]

	const produce = [
		<MenuItem key={'AddIssuance'} onClick={contextHandler('AddIssuance')} disabled={data?.data.isIssued}>
			<ListItemIcon>
				<IntegrationIcon fontSize={20} fill={'#363636'} />
			</ListItemIcon>
			Выдать в производство
		</MenuItem>,
	]
	const extending = [
		<MenuItem key={'AddExtending'} onClick={contextHandler('AddExtending')} disabled={data?.data.isIssued}>
			<ListItemIcon>
				<ClockIcon fontSize={18} fill={'#363636'} />
			</ListItemIcon>
			Продление срока годности
		</MenuItem>,
	]

	const place = [
		<MenuItem key={'SetPlace'} onClick={contextHandler('SetPlace')} disabled={data?.data.isIssued}>
			<ListItemIcon>
				<ExchangeIcon fontSize={18} fill={'#363636'} />
			</ListItemIcon>
			Задать место хранения
		</MenuItem>,
	]
	const notes = [
		<MenuItem key={'SetNotes'} onClick={contextHandler('SetNotes')}>
			<ListItemIcon>
				<EditDocIcon fontSize={18} fill={'#363636'} />
			</ListItemIcon>
			Изменить примечание
		</MenuItem>,
	]

	return (
		<>
			<Menu
				open={Boolean(contextMenu)}
				onClose={closeHandler}
				anchorReference='anchorPosition'
				anchorPosition={
					contextMenu ? { top: contextMenu.coords.mouseY, left: contextMenu.coords.mouseX } : undefined
				}
			>
				{useCheckPermission(PermRules.Graphite.Write) ? create : null}
				{useCheckPermission(PermRules.GraphitePurpose.Write) ? purpose : null}
				{useCheckPermission(PermRules.Issuance.Write) ? produce : null}
				{useCheckPermission(PermRules.Extending.Write) ? extending : null}
				{useCheckPermission(PermRules.GraphitePlace.Write) ? place : null}
				{useCheckPermission(PermRules.GraphiteNotes.Write) ? notes : null}
			</Menu>

			<SetPurposeDialog />
			<SetPlaceDialog />
			<SetNotesDialog />
			<ExtendingDialog />
			<IssuanceDialog />
		</>
	)
}

export default ContextMenu
