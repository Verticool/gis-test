const START_HOUR = 10
const END_HOUR = 14
const STEP_MINUTES = 15
const MINUTE_MS = 60_000

function buildTimePoints(): number[] {
	const start = new Date()
	start.setHours(START_HOUR, 0, 0, 0)

	const points: number[] = []
	const end = start.getTime() + (END_HOUR - START_HOUR) * 60 * MINUTE_MS

	for (let time = start.getTime(); time <= end; time += STEP_MINUTES * MINUTE_MS) {
		points.push(time)
	}

	return points
}

export const TIME_POINTS: readonly number[] = buildTimePoints()

export const DEFAULT_SELECTED_TIME: number = TIME_POINTS[0] ?? Date.now()

export function nearestTimePoint(time: number): number {
	let nearest = DEFAULT_SELECTED_TIME

	for (const point of TIME_POINTS) {
		if (Math.abs(point - time) < Math.abs(nearest - time)) {
			nearest = point
		}
	}

	return nearest
}

export const formatTimePoint = (time: number): string =>
	new Date(time).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
