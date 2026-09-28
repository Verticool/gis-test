import type {LayerId, LayerSeriesPoint} from '@/types/gis'
import type {SeriesState} from '@/stores'

export interface ChartRow {
	time: number
	[layerId: string]: number
}

const round = (value: number): number => Math.round(value * 10) / 10

export function buildChartRows(
	layerIds: readonly LayerId[],
	seriesById: Partial<Record<LayerId, SeriesState>>,
	times: readonly number[]
): ChartRow[] {
	const rows = new Map<number, ChartRow>(times.map(time => [time, {time}]))

	for (const id of layerIds) {
		const points: LayerSeriesPoint[] | null | undefined = seriesById[id]?.data
		if (!points) {
			continue
		}
		for (const point of points) {
			const row = rows.get(point.time)
			if (row) {
				row[id] = round(point.value)
			}
		}
	}

	return [...rows.values()]
}

export function valueAt(
	rows: readonly ChartRow[],
	time: number,
	layerId: LayerId
): number | null {
	const value = rows.find(row => row.time === time)?.[layerId]
	return typeof value === 'number' ? value : null
}
