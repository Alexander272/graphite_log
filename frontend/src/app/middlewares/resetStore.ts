import { createListenerMiddleware, type TypedStartListening } from '@reduxjs/toolkit'

import { apiSlice } from '@/app/apiSlice'
import type { AppDispatch, RootState } from '@/app/store'
import { resetUser } from '@/features/user/userSlice'
import { resetTable } from '@/features/table/tableSlice'
import { resetDialog } from '@/features/dialog/dialogSlice'
import { resetRealm } from '@/features/realms/realmSlice'

export const resetStoreListener = createListenerMiddleware()

const startResetStoreListener = resetStoreListener.startListening as TypedStartListening<RootState, AppDispatch>

startResetStoreListener({
	actionCreator: resetUser,
	effect: async (_, listenerApi) => {
		await listenerApi.delay(100)
		listenerApi.dispatch(resetTable())
		listenerApi.dispatch(resetDialog())
		listenerApi.dispatch(resetRealm())
		//TODO reset states
		listenerApi.dispatch(apiSlice.util.resetApiState())
	},
})
