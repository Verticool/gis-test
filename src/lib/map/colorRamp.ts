export type Rgb = readonly [number, number, number]

export function hexToRgb(hex: string): Rgb {
	const at = (start: number): number => {
		const value = Number.parseInt(hex.slice(start, start + 2), 16)
		return Number.isNaN(value) ? 0 : value
	}
	return [at(1), at(3), at(5)]
}

export function mixRgb(from: Rgb, to: Rgb, t: number): Rgb {
	const k = Math.min(1, Math.max(0, t))
	return [
		Math.round(from[0] + (to[0] - from[0]) * k),
		Math.round(from[1] + (to[1] - from[1]) * k),
		Math.round(from[2] + (to[2] - from[2]) * k)
	]
}

export const toRgba = (rgb: Rgb, alpha: number): string =>
	`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`

export function rampChannels(ramp: readonly string[], t: number): Rgb {
	const first = ramp[0] ?? '#000000'
	if (ramp.length < 2) {
		return hexToRgb(first)
	}

	const scaled = Math.min(1, Math.max(0, t)) * (ramp.length - 1)
	const index = Math.min(ramp.length - 2, Math.floor(scaled))
	const from = ramp[index] ?? first
	const to = ramp[index + 1] ?? from

	return mixRgb(hexToRgb(from), hexToRgb(to), scaled - index)
}

export const rampColor = (ramp: readonly string[], t: number, alpha: number): string =>
	toRgba(rampChannels(ramp, t), alpha)
