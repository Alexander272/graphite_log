import { Stack } from '@mui/material'
import { toast } from 'react-toastify'

import { useAppSelector } from '@/hooks/redux'
import { useImportFileMutation } from '../importApiSlice'
import { getRealm } from '@/features/realms/realmSlice'
import { ActiveRealm } from '@/features/realms/components/ActiveRealm'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { Upload } from './Upload/Upload'

export const Form = () => {
	const realm = useAppSelector(getRealm)

	const [upload, { isLoading }] = useImportFileMutation()

	const uploadHandler = async (file?: File | null) => {
		if (!file || !realm) return

		const payload = await upload({ file, realm: realm.id }).unwrap()
		if (payload.message) {
			toast.success(payload.message)
		}
	}

	return (
		<Stack width={'100%'} height={'100%'} spacing={2}>
			{isLoading && <BoxFallback />}

			<Stack width={'100%'} maxWidth={400} alignSelf={'center'} border={'1px solid #ccc'} borderRadius={3}>
				<ActiveRealm />
			</Stack>

			<Upload onChange={uploadHandler} sx={{ width: '100%' }} />
		</Stack>
	)
}
