import {AnalyticsPanel} from '@/features/analytics'
import {MapPanel} from '@/features/map'
import {useDataSync} from '@/stores'

export function Workspace() {
	useDataSync()

	return (
		<div className='flex h-dvh flex-col overflow-hidden bg-canvas text-ink'>
			<MapPanel />

			<div className='shrink-0 border-t border-line bg-surface px-2 pt-2 pb-2 sm:px-3 sm:pb-3'>
				<AnalyticsPanel />
			</div>
		</div>
	)
}
