import type {LayerFrame, LayerId} from '@/types/gis'
import type {AppState, AppStore, RequestStatus} from './appStore'

export const selectActiveLayerId = (state: AppState): LayerId => state.activeLayerId

export const selectSelectedTime = (state: AppState): number => state.selectedTime

export const selectSeriesById = (state: AppState): AppState['seriesById'] => state.seriesById

export type ActiveFrameView = {
	id: LayerId
	status: RequestStatus
	requestedTime: number | null
	dataTime: number | null
	cells: number
	error: string | null
}

export const selectActiveFrameView = (state: AppState): ActiveFrameView => {
	const id = state.activeLayerId
	const frame = state.frameById[id]

	return {
		id,
		status: frame?.status ?? 'idle',
		requestedTime: frame?.requestedTime ?? null,
		dataTime: frame?.data?.time ?? null,
		cells: frame?.data?.cells.length ?? 0,
		error: frame?.error ?? null
	}
}

export const readActiveLayerId = (store: AppStore): LayerId => store.get('activeLayerId')

export const readLayerFrame = (store: AppStore, layerId: LayerId): LayerFrame | null =>
	store.get('frameById')[layerId]?.data ?? null
