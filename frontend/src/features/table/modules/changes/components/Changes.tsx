import { useState, type FC } from 'react'
import { Stack } from '@mui/material'

import type { TabVariants } from '../types/tabs'
import { useGetChangesQuery } from '../changesApiSlice'
import { BoxFallback } from '@/components/Fallback/BoxFallback'
import { ChangesTabs } from './Tabs'
import { Graphite } from './Graphite'
import { Purpose } from './Purpose'
import { Place } from './Place'
import { Extending } from './Extending'
import { Issuance } from './Issuance'

type Props = {
	graphite: string
}

export const Changes: FC<Props> = ({ graphite }) => {
	const [tab, setTab] = useState<TabVariants>('graphite')

	const { data, isFetching } = useGetChangesQuery({ graphite, section: tab }, { skip: !graphite })

	return (
		<Stack mt={-2.5}>
			<ChangesTabs value={tab} onChange={setTab} />

			<Stack>
				{isFetching ? <BoxFallback /> : null}

				{tab == 'graphite' && <Graphite data={data?.data || []} />}
				{tab == 'purpose' && <Purpose data={data?.data || []} />}
				{tab == 'place' && <Place data={data?.data || []} />}
				{tab == 'extending' && <Extending data={data?.data || []} />}
				{tab == 'issuance' && <Issuance data={data?.data || []} />}
			</Stack>
		</Stack>
	)
}
