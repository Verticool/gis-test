export type LayerId = 'temperature' | 'wind' | 'insolation'

export type LayerRenderKind = 'raster' | 'arrows' | 'points' | 'polygons'

export type ValueBounds = {
	min: number
	max: number
}

export type LayerCell = {
	lon: number
	lat: number
	stepLon: number
	stepLat: number
	value: number

	direction?: number
}

export type LayerFrame = {
	layerId: LayerId
	time: number
	bounds: ValueBounds
	cells: LayerCell[]
}

export type LayerSeriesPoint = {
	time: number
	value: number
}

export type LayerSeries = {
	layerId: LayerId
	bounds: ValueBounds
	points: LayerSeriesPoint[]
}
