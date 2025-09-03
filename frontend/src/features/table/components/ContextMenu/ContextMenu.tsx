import { ListItemIcon, Menu, MenuItem } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { changeDialogIsOpen, type DialogVariants } from '@/features/dialog/dialogSlice'
import { getContextMenu, setContextMenu } from '../../tableSlice'
import { ClockIcon } from '@/components/Icons/ClockIcon'
import { EditDocIcon } from '@/components/Icons/EditDoc'
import { ExchangeIcon } from '@/components/Icons/ExchangeIcon'
import { OperationIcon } from '@/components/Icons/OperationIcon'
import { IntegrationIcon } from '@/components/Icons/IntegrationIcon'
import { SetPurposeDialog } from '../Dialogs/SetPurpose'
import { SetPlaceDialog } from '../Dialogs/SetPlace'
import { SetNotesDialog } from '../Dialogs/SetNotes'
import { CreateOnBase } from './CreateOnBase'

export const ContextMenu = () => {
	const contextMenu = useAppSelector(getContextMenu)
	const dispatch = useAppDispatch()

	const closeHandler = () => {
		dispatch(setContextMenu())
	}

	const contextHandler = (variant: DialogVariants) => () => {
		dispatch(changeDialogIsOpen({ variant, isOpen: true, context: contextMenu?.active }))
		closeHandler()
	}

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
				<CreateOnBase />

				<MenuItem onClick={contextHandler('SetPurpose')}>
					<ListItemIcon>
						<OperationIcon fontSize={20} fill={'#363636'} />
					</ListItemIcon>
					Задать назначение
				</MenuItem>
				<MenuItem onClick={contextHandler('AddRelease')}>
					<ListItemIcon>
						<IntegrationIcon fontSize={20} fill={'#363636'} />
					</ListItemIcon>
					Выдать в производство
				</MenuItem>
				<MenuItem onClick={contextHandler('AddExtending')}>
					<ListItemIcon>
						<ClockIcon fontSize={18} fill={'#363636'} />
					</ListItemIcon>
					Продление срока годности
				</MenuItem>
				<MenuItem onClick={contextHandler('SetPlace')}>
					<ListItemIcon>
						<ExchangeIcon fontSize={18} fill={'#363636'} />
					</ListItemIcon>
					Задать место хранения
				</MenuItem>
				<MenuItem onClick={contextHandler('SetNotes')}>
					<ListItemIcon>
						<EditDocIcon fontSize={18} fill={'#363636'} />
					</ListItemIcon>
					Изменить примечание
				</MenuItem>
			</Menu>

			<SetPurposeDialog />
			<SetPlaceDialog />
			<SetNotesDialog />
		</>
	)
}

export default ContextMenu
