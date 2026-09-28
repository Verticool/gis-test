import {buildFrame, buildSeries} from '@/lib/gis/mockLayerData'
import {readCachedFrame, writeCachedFrame} from './frameCache'
import type {LayerFrame, LayerId, LayerSeries} from '@/types/gis'

const LATENCY_MS = {min: 180, max: 900}

const FAILURE_RATE = 0

const abortError = (): DOMException => new DOMException('Запрос отменён', 'AbortError')

export const isAbortError = (error: unknown): boolean =>
	error instanceof DOMException && error.name === 'AbortError'

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		if (signal?.aborted === true) {
			reject(abortError())
			return
		}

		const onAbort = (): void => {
			clearTimeout(timer)
			reject(abortError())
		}

		const timer = setTimeout(() => {
			signal?.removeEventListener('abort', onAbort)
			resolve()
		}, ms)

		signal?.addEventListener('abort', onAbort, {once: true})
	})
}

const latency = (): number =>
	LATENCY_MS.min + Math.round(Math.random() * (LATENCY_MS.max - LATENCY_MS.min))

function maybeFail(): void {
	if (Math.random() < FAILURE_RATE) {
		throw new Error('Не удалось получить данные слоя')
	}
}

export async function fetchLayerFrame(
	layerId: LayerId,
	time: number,
	signal?: AbortSignal
): Promise<LayerFrame> {
	await sleep(latency(), signal)
	maybeFail()

	const frame = buildFrame(layerId, time)
	writeCachedFrame(frame)
	return frame
}

const prefetchInFlight = new Set<string>()

export function prefetchFrame(layerId: LayerId, time: number): void {
	if (readCachedFrame(layerId, time)) {
		return
	}

	const key = `${layerId}:${time}`
	if (prefetchInFlight.has(key)) {
		return
	}

	prefetchInFlight.add(key)
	fetchLayerFrame(layerId, time).then(
		() => prefetchInFlight.delete(key),
		() => prefetchInFlight.delete(key)
	)
}

export async function fetchLayerSeries(
	layerId: LayerId,
	signal?: AbortSignal
): Promise<LayerSeries> {
	await sleep(latency() + 200, signal)
	maybeFail()
	return buildSeries(layerId)
}
