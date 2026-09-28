function hash(x: number, y: number, seed: number): number {
	const raw = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123
	return raw - Math.floor(raw)
}

export function valueNoise2D(x: number, y: number, seed: number): number {
	const cx = Math.floor(x)
	const cy = Math.floor(y)
	const fx = x - cx
	const fy = y - cy

	const sx = fx * fx * (3 - 2 * fx)
	const sy = fy * fy * (3 - 2 * fy)

	const a = hash(cx, cy, seed)
	const b = hash(cx + 1, cy, seed)
	const c = hash(cx, cy + 1, seed)
	const d = hash(cx + 1, cy + 1, seed)

	const top = a + sx * (b - a)
	const bottom = c + sx * (d - c)

	return top + sy * (bottom - top)
}

export function fbm2D(x: number, y: number, seed: number, octaves = 4): number {
	let amplitude = 1
	let frequency = 1
	let sum = 0
	let norm = 0

	for (let octave = 0; octave < octaves; octave += 1) {
		sum += amplitude * valueNoise2D(x * frequency, y * frequency, seed + octave * 13)
		norm += amplitude
		amplitude *= 0.5
		frequency *= 2
	}

	return sum / norm
}

export const signedFbm2D = (x: number, y: number, seed: number, octaves = 4): number =>
	fbm2D(x, y, seed, octaves) * 2 - 1

export const gaussian = (distance: number, sigma: number): number =>
	Math.exp(-(distance * distance) / (2 * sigma * sigma))

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

export const clamp = (value: number, min: number, max: number): number =>
	Math.min(max, Math.max(min, value))
