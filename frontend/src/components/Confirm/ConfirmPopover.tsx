import { useState, type ReactNode, isValidElement, cloneElement, Children, type MouseEventHandler } from 'react'
import { Popover, Button, Typography, Box, type ButtonProps, useTheme } from '@mui/material'
import { WarningIcon } from '../Icons/WarningIcon'

interface ConfirmPopoverProps {
	/** Текст вопроса (например: "Удалить статью навсегда?") */
	title?: ReactNode
	/** Подробное описание (по желанию) */
	description?: ReactNode
	/** Текст кнопки подтверждения */
	confirmText?: string
	/** Цвет кнопки подтверждения (по умолчанию error) */
	confirmColor?: Exclude<ButtonProps['color'], 'inherit'>
	/** Текст кнопки отмены */
	cancelText?: string
	/** Дети — триггер, который открывает поповер (кнопка, иконка и т.д.) */
	children: ReactNode
	/** Колбэк при подтверждении */
	onConfirm: () => void
	/** Отключает кнопку подтверждения во время выполнения */
	loading?: boolean
	/** Открытие по умолчанию (для управляемого режима) */
	open?: boolean
	/** Колбэк для контролируемого открытия/закрытия */
	onOpenChange?: (open: boolean) => void
}

/**
 * Пример использования:
 *
 * <ConfirmPopover
 *   title="Удалить статью?"
 *   description="Это действие нельзя отменить."
 *   onConfirm={() => deleteArticle(id)}
 * >
 *   <IconButton color="error"><DeleteIcon /></IconButton>
 * </ConfirmPopover>
 */
export default function ConfirmPopover({
	title = 'Вы уверены?',
	description,
	confirmText = 'Да, удалить',
	cancelText = 'Отмена',
	confirmColor = 'error',
	children,
	onConfirm,
	loading = false,
	open: controlledOpen,
	onOpenChange,
}: ConfirmPopoverProps) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
	const isControlled = controlledOpen !== undefined
	const open = isControlled ? controlledOpen : Boolean(anchorEl)
	const { palette } = useTheme()

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		if (!isControlled) {
			setAnchorEl(event.currentTarget)
		}
		onOpenChange?.(true)
	}

	const handleClose = () => {
		if (!isControlled) {
			setAnchorEl(null)
		}
		onOpenChange?.(false)
	}

	const handleConfirm = () => {
		onConfirm()
		handleClose()
	}

	// Чтобы Popover корректно работал с IconButton и другими элементами
	const triggerElement = Children.only(children)
	const enhancedTrigger = isValidElement(triggerElement) ? (
		cloneElement(triggerElement as React.ReactElement<{ onClick?: React.MouseEventHandler<HTMLElement> }>, {
			onClick: (e: React.MouseEvent<HTMLElement>) => {
				// Безопасно вызываем оригинальный обработчик
				const originalOnClick = (triggerElement?.props as { onClick?: MouseEventHandler<HTMLElement> })?.onClick
				if (typeof originalOnClick === 'function') {
					originalOnClick(e)
				}
				// Не вызываем handleClick, если событие было предотвращено (например, в форме)
				if (!e.defaultPrevented) {
					handleClick(e)
				}
			},
		})
	) : (
		<div onClick={handleClick}>{children}</div>
	)

	return (
		<>
			{enhancedTrigger}

			<Popover
				open={open}
				anchorEl={isControlled ? null : anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
				slotProps={{
					paper: {
						sx: {
							py: 1.2,
							px: 2,
							minWidth: 280,
							maxWidth: 360,
						},
					},
				}}
			>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					{/* Иконка предупреждения + заголовок */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<WarningIcon fill={palette[confirmColor].main} />
						<Typography variant='subtitle1' fontWeight={600}>
							{title}
						</Typography>
					</Box>

					{/* Описание */}
					{description && (
						<Typography variant='body2' color='text.secondary'>
							{description}
						</Typography>
					)}

					{/* Кнопки */}
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: 1,
							mt: 1,
						}}
					>
						<Button
							variant='text'
							onClick={handleClose}
							disabled={loading}
							fullWidth
							sx={{ textTransform: 'inherit' }}
						>
							{cancelText}
						</Button>
						<Button
							variant='outlined'
							color={confirmColor}
							onClick={handleConfirm}
							disabled={loading}
							fullWidth
							autoFocus
							sx={{ textTransform: 'inherit' }}
						>
							{loading ? 'Выполняется...' : confirmText}
						</Button>
					</Box>
				</Box>
			</Popover>
		</>
	)
}
