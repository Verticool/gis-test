import Feature from 'ol/Feature'
import type {FeatureLike} from 'ol/Feature'
import Point from 'ol/geom/Point'
import Polygon from 'ol/geom/Polygon'
import ImageLayer from 'ol/layer/Image'
import VectorLayer from 'ol/layer/Vector'
import {fromLonLat} from 'ol/proj'
import ImageStatic from 'ol/source/ImageStatic'
import VectorSource from 'ol/source/Vector'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import RegularShape from 'ol/style/RegularShape'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'
import type BaseLayer from 'ol/layer/Base'
import type {LayerDescriptor} from '@/config/layers'
import type {LayerCell, LayerFrame, LayerRenderKind, ValueBounds} from '@/types/gis'
import {rampColor} from './colorRamp'
import {renderFieldImage} from './fieldImage'
import {REGION_EXTENT} from './region'

const POINT_RADIUS = {min: 2.5, max: 6}
const ARROW_RADIUS = {min: 4, max: 9}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

const normalize = (value: number, bounds: ValueBounds): number => {
	const span = bounds.max - bounds.min
	return span <= 0 ? 0.5 : clamp01((value - bounds.min) / span)
}

const numberOf = (feature: FeatureLike, key: string): number => {
	const raw: unknown = feature.get(key)
	return typeof raw === 'number' ? raw : 0
}

function pointsStyle(descriptor: LayerDescriptor, t: number): Style {
	return new Style({
		image: new CircleStyle({
			fill: new Fill({color: rampColor(descriptor.ramp, t, descriptor.fillAlpha)}),
			radius: POINT_RADIUS.min + (POINT_RADIUS.max - POINT_RADIUS.min) * t,
			stroke: new Stroke({color: 'rgba(255, 255, 255, 0.8)', width: 1})
		})
	})
}

function polygonsStyle(descriptor: LayerDescriptor, t: number): Style {
	return new Style({
		fill: new Fill({color: rampColor(descriptor.ramp, t, descriptor.fillAlpha)})
	})
}

function arrowStyle(descriptor: LayerDescriptor, t: number, direction: number): Style {
	return new Style({
		image: new RegularShape({
			fill: new Fill({color: rampColor(descriptor.ramp, t, descriptor.fillAlpha)}),
			points: 3,
			radius: ARROW_RADIUS.min + (ARROW_RADIUS.max - ARROW_RADIUS.min) * t,
			rotation: (direction * Math.PI) / 180,
			stroke: new Stroke({color: 'rgba(255, 255, 255, 0.7)', width: 1})
		})
	})
}

function styleFor(
	descriptor: LayerDescriptor,
	bounds: ValueBounds
): (feature: FeatureLike) => Style {
	return feature => {
		const t = normalize(numberOf(feature, 'value'), bounds)

		switch (descriptor.renderKind) {
			case 'arrows':
				return arrowStyle(descriptor, t, numberOf(feature, 'direction'))
			case 'points':
				return pointsStyle(descriptor, t)
			default:
				return polygonsStyle(descriptor, t)
		}
	}
}

function ring(cell: LayerCell): Array<[number, number]> {
	const west = cell.lon - cell.stepLon / 2
	const east = cell.lon + cell.stepLon / 2
	const south = cell.lat - cell.stepLat / 2
	const north = cell.lat + cell.stepLat / 2
	return [
		[west, south],
		[east, south],
		[east, north],
		[west, north],
		[west, south]
	]
}

function toFeature(cell: LayerCell, renderKind: LayerRenderKind): Feature {
	const properties = {direction: cell.direction ?? 0, value: cell.value}

	if (renderKind === 'polygons') {
		return new Feature({
			...properties,
			geometry: new Polygon([ring(cell).map(([lon, lat]) => fromLonLat([lon, lat]))])
		})
	}

	return new Feature({
		...properties,
		geometry: new Point(fromLonLat([cell.lon, cell.lat]))
	})
}

export type FrameLayer = {
	layers: BaseLayer[]
	render: (frame: LayerFrame, descriptor: LayerDescriptor) => void
	clear: () => void
}

export function createFrameLayer(): FrameLayer {
	const source = new VectorSource<Feature>()
	const vector = new VectorLayer({source, visible: false, zIndex: 10})
	const raster = new ImageLayer({visible: false, zIndex: 5})

	let kind: 'raster' | 'vector' | 'none' = 'none'
	let rasterSeq = 0

	const hideAll = (): void => {
		raster.setVisible(false)
		vector.setVisible(false)
	}

	function loadRaster(url: string): void {
		const seq = ++rasterSeq
		const image = new Image()

		image.onload = () => {
			if (seq !== rasterSeq || kind !== 'raster') {
				return
			}
			raster.setSource(
				new ImageStatic({imageExtent: REGION_EXTENT, projection: 'EPSG:3857', url})
			)
			hideAll()
			raster.setVisible(true)
		}

		image.src = url
	}

	return {
		layers: [raster, vector],

		render(frame, descriptor) {
			if (descriptor.renderKind === 'raster') {

				kind = 'raster'
				source.clear()
				hideAll()

				const url = renderFieldImage(frame, descriptor)
				if (url !== '') {
					loadRaster(url)
				}
				return
			}

			kind = 'vector'
			rasterSeq += 1

			vector.setStyle(styleFor(descriptor, frame.bounds))
			source.clear()
			source.addFeatures(frame.cells.map(cell => toFeature(cell, descriptor.renderKind)))
			hideAll()
			vector.setVisible(true)
		},

		clear() {
			kind = 'none'
			rasterSeq += 1
			source.clear()
			hideAll()
		}
	}
}
