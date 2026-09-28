import {createVedro} from 'vedro'
import {DEFAULT_SELECTED_TIME} from '@/config/time'
import type {LayerFrame, LayerId, LayerSeriesPoint} from '@/types/gis'

export type RequestStatus = 'idle' | 'loading' | 'ready' | 'error'

export type FrameState = {
	status: RequestStatus
	requestId: number
	requestedTime: number | null

	data: LayerFrame | null
	error: string | null
}

export type SeriesState = {
	status: RequestStatus
	requestId: number
	data: LayerSeriesPoint[] | null
	error: string | null
}

export type AppState = {

	activeLayerId: LayerId

	selectedTime: number
	frameById: Partial<Record<LayerId, FrameState>>
	seriesById: Partial<Record<LayerId, SeriesState>>
}

const initialState: AppState = {
	activeLayerId: 'temperature',
	selectedTime: DEFAULT_SELECTED_TIME,
	frameById: {},
	seriesById: {}
}

export const {
	Context: AppStoreContext,
	Provider: AppStoreProvider,
	useStore: useAppStoreUnsafe,
	useSelector: useAppSelectorUnsafe,
	useDispatch: useAppDispatchUnsafe
} = createVedro<AppState>(initialState)

export type AppStore = ReturnType<typeof useAppStoreUnsafe>
export type AppDispatch = typeof useAppDispatchUnsafe
export type AppSelector = typeof useAppSelectorUnsafe

export const useAppStore: typeof useAppStoreUnsafe = () => {
	const store = useAppStoreUnsafe() as AppStore | undefined
	if (!store) {
		throw new Error('useAppStore: компонент вне <AppStoreProvider>')
	}
	return store
}

export const useAppSelector: AppSelector = cb => {
	useAppStore()
	return useAppSelectorUnsafe(cb)
}

export const useAppDispatch: AppDispatch = () => {
	const store = useAppStore()
	return store.dispatch.bind(store) as ReturnType<AppDispatch>
}
