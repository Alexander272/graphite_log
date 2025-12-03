import { Stack } from '@mui/material'

import { RealmsList } from '@/features/realms/components/RealmsList'
import { useState } from 'react'
import { NotificationList } from '@/features/notifications/components/NotificationsList/NotificationList'

export default function Notifications() {
	const [realm, setRealm] = useState('new')

	const realmHandler = (realm: string) => {
		setRealm(realm)
	}

	return (
		<Stack direction={'row'} spacing={2} height={'100%'}>
			<RealmsList realm={realm} setRealm={realmHandler} />
			{realm != 'new' && <NotificationList realm={realm} />}
		</Stack>
	)
}
