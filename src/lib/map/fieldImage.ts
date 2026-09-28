import type {LayerDescriptor} from '@/config/layers'
import type {LayerFrame} from '@/types/gis'
import {rampChannels} from './colorRamp'

const PIXELS_PER_CELL = 18

const FEATHER = 0.07

const IMAGE_CACHE_LIMIT = 16

const images = new Map<string, string>()

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

const smoothstep = (value: number): number => {
	const x = clamp01(value)
	return x * x * (3 - 2 * x)
}

function axes(frame: LayerFrame): {lons: number[]; lats: number[]} {
	const lons = [...new Set(frame.cells.map(cell => cell.lon))].sort((a, b) => a - b)

	const lats = [...new Set(frame.cells.map(cell => cell.lat))].sort((a, b) => b - a)
	return {lons, lats}
}

function grid(frame: LayerFrame, lons: number[], lats: number[]): number[][] {
	const byKey = new Map(frame.cells.map(cell => [`${cell.lon}|${cell.lat}`, cell.value]))
	return lats.map(lat => lons.map(lon => byKey.get(`${lon}|${lat}`) ?? 0))
}

const fade = (position: number, feather: number, size: number): number =>
	feather <= 0
		? 1
		: smoothstep(Math.min(position, size - 1 - position) / feather)

export function renderFieldImage(frame: LayerFrame, descriptor: LayerDescriptor): string {

	if (typeof document === 'undefined') {
		return ''
	}

	const cacheKey = `${frame.layerId}:${frame.time}`
	const ready = images.get(cacheKey)
	if (ready !== undefined) {
		return ready
	}

	const {lons, lats} = axes(frame)
	if (lons.length < 2 || lats.length < 2) {
		return ''
	}

	const values = grid(frame, lons, lats)
	const width = (lons.length - 1) * PIXELS_PER_CELL + 1
	const height = (lats.length - 1) * PIXELS_PER_CELL + 1

	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height

	const ctx = canvas.getContext('2d')
	if (!ctx) {
		return ''
	}

	const image = ctx.createImageData(width, height)
	const span = Math.max(1e-6, frame.bounds.max - frame.bounds.min)
	const featherX = width * FEATHER
	const featherY = height * FEATHER
	const maxAlpha = 255 * descriptor.fillAlpha

	for (let pixelY = 0; pixelY < height; pixelY += 1) {
		const gy = pixelY / PIXELS_PER_CELL
		const row0 = Math.floor(gy)
		const row1 = Math.min(lats.length - 1, row0 + 1)
		const wy = gy - row0

		for (let pixelX = 0; pixelX < width; pixelX += 1) {
			const gx = pixelX / PIXELS_PER_CELL
			const col0 = Math.floor(gx)
			const col1 = Math.min(lons.length - 1, col0 + 1)
			const wx = gx - col0

			const top = values[row0]
			const bottom = values[row1]
			const upper = (top?.[col0] ?? 0) + ((top?.[col1] ?? 0) - (top?.[col0] ?? 0)) * wx
			const lower =
				(bottom?.[col0] ?? 0) + ((bottom?.[col1] ?? 0) - (bottom?.[col0] ?? 0)) * wx
			const value = upper + (lower - upper) * wy

			const [r, g, b] = rampChannels(descriptor.ramp, (value - frame.bounds.min) / span)
			const alpha = maxAlpha * fade(pixelX, featherX, width) * fade(pixelY, featherY, height)

			const offset = (pixelY * width + pixelX) * 4
			image.data[offset] = r
			image.data[offset + 1] = g
			image.data[offset + 2] = b
			image.data[offset + 3] = Math.round(alpha)
		}
	}

	ctx.putImageData(image, 0, 0)

	const url = canvas.toDataURL('image/png')
	images.set(cacheKey, url)
	while (images.size > IMAGE_CACHE_LIMIT) {
		const oldest = images.keys().next().value
		if (oldest === undefined) {
			break
		}
		images.delete(oldest)
	}

	return url
}
