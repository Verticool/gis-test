import {LAYER_IDS} from '@/config/layers'
import {TIME_POINTS, nearestTimePoint} from '@/config/time'
import {readCachedFrame} from '@/lib/api/frameCache'
import {fetchLayerFrame, fetchLayerSeries, isAbortError, prefetchFrame} from '@/lib/api/gisApi'
import type {LayerId} from '@/types/gis'
import type {AppStore, FrameState, SeriesState} from './appStore'

const frameRequests = new Map<LayerId, AbortController>()
const seriesRequests = new Map<LayerId, AbortController>()

let requestSeq = 0

const idleFrame = (): FrameState => ({
	status: 'idle',
	requestId: 0,
	requestedTime: null,
	data: null,
	error: null
})

const reason = (error: unknown): string =>
	error instanceof Error ? error.message : 'Неизвестная ошибка'

export function setSelectedTime(store: AppStore, time: number): void {
	const point = nearestTimePoint(time)
	if (store.get('selectedTime') !== point) {
		store.dispatch('selectedTime', point)
	}
}

export function selectLayer(store: AppStore, layerId: LayerId): void {
	const previous = store.get('activeLayerId')
	if (previous === layerId) {
		return
	}

	store.dispatch('activeLayerId', layerId)
	releaseLayer(store, previous)
}

export function releaseLayer(store: AppStore, layerId: LayerId): void {
	frameRequests.get(layerId)?.abort()
	frameRequests.delete(layerId)
	store.dispatch(state => ({frameById: {...state.frameById, [layerId]: idleFrame()}}))
}

export function ensureFrame(store: AppStore, layerId: LayerId, time: number): void {
	const current = store.get('frameById')[layerId]
	const sameTime = current?.requestedTime === time

	if (sameTime && (current.status === 'loading' || current.status === 'ready')) {
		return
	}

	loadFrame(store, layerId, time)
}

export function ensureSeries(store: AppStore, layerId: LayerId): void {
	const status = store.get('seriesById')[layerId]?.status
	if (status !== 'loading' && status !== 'ready') {
		loadSeries(store, layerId)
	}
}

export function retryLayer(store: AppStore, layerId: LayerId): void {
	loadFrame(store, layerId, store.get('selectedTime'))
	if (store.get('seriesById')[layerId]?.status === 'error') {
		loadSeries(store, layerId)
	}
}

export function syncData(store: AppStore): void {
	const layerId = store.get('activeLayerId')
	ensureSeries(store, layerId)
	ensureFrame(store, layerId, store.get('selectedTime'))
}

export function warmUp(store: AppStore): void {
	const time = store.get('selectedTime')
	const activeId = store.get('activeLayerId')

	for (const layerId of LAYER_IDS) {
		ensureSeries(store, layerId)
		if (layerId !== activeId) {
			prefetchFrame(layerId, time)
		}
	}

	const index = TIME_POINTS.indexOf(time)
	for (const step of [-1, 1]) {
		const neighbour = TIME_POINTS[index + step]
		if (neighbour !== undefined) {
			prefetchFrame(activeId, neighbour)
		}
	}
}

function loadFrame(store: AppStore, layerId: LayerId, time: number): void {
	frameRequests.get(layerId)?.abort()
	frameRequests.delete(layerId)

	const cached = readCachedFrame(layerId, time)
	if (cached !== null) {
		const requestId = ++requestSeq
		store.dispatch(state => ({
			frameById: {
				...state.frameById,
				[layerId]: {
					status: 'ready',
					requestId,
					requestedTime: time,
					data: cached,
					error: null
				}
			}
		}))
		return
	}

	const controller = new AbortController()
	frameRequests.set(layerId, controller)

	const requestId = ++requestSeq
	const previous = store.get('frameById')[layerId]?.data ?? null

	store.dispatch(state => ({
		frameById: {
			...state.frameById,
			[layerId]: {status: 'loading', requestId, requestedTime: time, data: previous, error: null}
		}
	}))

	fetchLayerFrame(layerId, time, controller.signal).then(
		frame => {
			const current = store.get('frameById')[layerId]
			if (current?.requestId !== requestId) {
				return
			}
			store.dispatch(state => ({
				frameById: {
					...state.frameById,
					[layerId]: {
						status: 'ready',
						requestId,
						requestedTime: frame.time,
						data: frame,
						error: null
					}
				}
			}))
		},
		error => {

			if (isAbortError(error)) {
				return
			}
			const current = store.get('frameById')[layerId]
			if (current?.requestId !== requestId) {
				return
			}
			store.dispatch(state => ({
				frameById: {
					...state.frameById,
					[layerId]: {...current, status: 'error', error: reason(error)}
				}
			}))
		}
	)
}

function loadSeries(store: AppStore, layerId: LayerId): void {
	seriesRequests.get(layerId)?.abort()
	const controller = new AbortController()
	seriesRequests.set(layerId, controller)

	const requestId = ++requestSeq
	const previous = store.get('seriesById')[layerId]?.data ?? null

	store.dispatch(state => ({
		seriesById: {
			...state.seriesById,
			[layerId]: {status: 'loading', requestId, data: previous, error: null}
		}
	}))

	fetchLayerSeries(layerId, controller.signal).then(
		series => {
			const current = store.get('seriesById')[layerId]
			if (current?.requestId !== requestId) {
				return
			}
			store.dispatch(state => ({
				seriesById: {
					...state.seriesById,
					[layerId]: {status: 'ready', requestId, data: series.points, error: null}
				}
			}))
		},
		error => {
			if (isAbortError(error)) {
				return
			}
			const current = store.get('seriesById')[layerId]
			if (current?.requestId !== requestId) {
				return
			}
			const failed: SeriesState = {...current, status: 'error', error: reason(error)}
			store.dispatch(state => ({seriesById: {...state.seriesById, [layerId]: failed}}))
		}
	)
}
