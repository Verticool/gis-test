import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'

export type BasemapDescriptor = {
	id: string
	label: string

	url: string
	attribution: string
	maxZoom: number
}

export const ESRI_LIGHT_GRAY: BasemapDescriptor = {
	id: 'esri-light-gray',
	label: 'Светлая',
	url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
	attribution: 'Tiles © <a href="https://www.esri.com/">Esri</a> — Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}

export const ESRI_IMAGERY: BasemapDescriptor = {
	id: 'esri-imagery',
	label: 'Спутник',
	url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
	attribution: 'Tiles © Esri — Esri, Maxar, Earthstar Geographics',
	maxZoom: 19
}

export const OSM_STANDARD: BasemapDescriptor = {
	id: 'osm',
	label: 'OpenStreetMap',
	url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
	attribution:
		'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	maxZoom: 19
}

export const BASEMAPS: Record<string, BasemapDescriptor> = {
	[ESRI_LIGHT_GRAY.id]: ESRI_LIGHT_GRAY,
	[ESRI_IMAGERY.id]: ESRI_IMAGERY,
	[OSM_STANDARD.id]: OSM_STANDARD
}

export const DEFAULT_BASEMAP = ESRI_LIGHT_GRAY

export const getBasemap = (id: string): BasemapDescriptor => BASEMAPS[id] ?? DEFAULT_BASEMAP

export function createBaseLayer(
	basemap: BasemapDescriptor = DEFAULT_BASEMAP
): TileLayer<XYZ> {
	return new TileLayer({
		source: new XYZ({
			attributions: basemap.attribution,
			maxZoom: basemap.maxZoom,
			url: basemap.url
		}),
		zIndex: 0
	})
}
