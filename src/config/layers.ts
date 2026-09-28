import type {LayerId, LayerRenderKind, ValueBounds} from '@/types/gis'

export type LayerDescriptor = {
	id: LayerId
	label: string
	unit: string

	color: string

	ramp: readonly string[]

	renderKind: LayerRenderKind

	fillAlpha: number
	range: ValueBounds

	cellStep: {lon: number; lat: number}
}

export const LAYER_IDS: readonly LayerId[] = ['temperature', 'wind', 'insolation']

export const LAYER_REGISTRY: Record<LayerId, LayerDescriptor> = {
	temperature: {
		id: 'temperature',
		label: 'Температура',
		unit: '°C',
		color: '#e2582b',
		ramp: ['#2f6fb5', '#7fb8e0', '#f3c969', '#dd5a2b'],
		renderKind: 'raster',
		fillAlpha: 0.34,
		range: {min: -5, max: 40},
		cellStep: {lon: 0.05, lat: 0.04}
	},
	wind: {
		id: 'wind',
		label: 'Ветер',
		unit: 'м/с',
		color: '#2f7fd1',
		ramp: ['#dbeaf7', '#6ba3d8', '#1f4e9c'],
		renderKind: 'arrows',
		fillAlpha: 0.72,
		range: {min: 0, max: 25},
		cellStep: {lon: 0.1, lat: 0.075}
	},
	insolation: {
		id: 'insolation',
		label: 'Инсоляция',
		unit: 'Вт/м²',
		color: '#d9a521',
		ramp: ['#fdf3cf', '#f6c445', '#c97a0d'],
		renderKind: 'polygons',
		fillAlpha: 0.26,
		range: {min: 0, max: 1000},
		cellStep: {lon: 0.1, lat: 0.075}
	}
}

export const getLayerDescriptor = (id: LayerId): LayerDescriptor => LAYER_REGISTRY[id]

export const REGION_BOUNDS = {
	west: 73.8,
	south: 42.4,
	east: 75.4,
	north: 43.3
} as const
