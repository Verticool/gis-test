import type {LayerFrame, LayerId} from '@/types/gis'

const LIMIT = 24

const cache = new Map<string, LayerFrame>()

const key = (layerId: LayerId, time: number): string => `${layerId}:${time}`

export function readCachedFrame(layerId: LayerId, time: number): LayerFrame | null {
	return cache.get(key(layerId, time)) ?? null
}

export function writeCachedFrame(frame: LayerFrame): void {
	const frameKey = key(frame.layerId, frame.time)

	cache.delete(frameKey)
	cache.set(frameKey, frame)

	while (cache.size > LIMIT) {
		const oldest = cache.keys().next().value
		if (oldest === undefined) {
			break
		}
		cache.delete(oldest)
	}
}
