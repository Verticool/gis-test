import {LAYER_REGISTRY, REGION_BOUNDS} from '@/config/layers'
import {TIME_POINTS} from '@/config/time'
import type {LayerCell, LayerFrame, LayerId, LayerSeries, ValueBounds} from '@/types/gis'
import {clamp, clamp01, fbm2D, gaussian, signedFbm2D, valueNoise2D} from './noise'

const SEED: Record<LayerId, number> = {
	temperature: 11,
	wind: 23,
	insolation: 37
}

const CITY = {lon: 74.6, lat: 42.87}

const CITY_SIGMA = 0.11

const DRIFT_DEG_PER_HOUR = 0.12

const LAT_SPAN = REGION_BOUNDS.north - REGION_BOUNDS.south

const round = (value: number, digits: number): number => {
	const scale = 10 ** digits
	return Math.round(value * scale) / scale
}

const hoursOfDay = (time: number): number => {
	const date = new Date(time)
	return date.getHours() + date.getMinutes() / 60
}

const hoursFromStart = (time: number): number =>
	(time - (TIME_POINTS[0] ?? time)) / 3_600_000

const sunHeight = (hours: number): number =>
	Math.max(0, Math.sin((Math.PI * (hours - 6.3)) / 12.5))

const southness = (lat: number): number =>
	clamp01((REGION_BOUNDS.north - lat) / LAT_SPAN)

function drift(time: number, speedFactor = 1): {lon: number; lat: number} {
	const hours = hoursFromStart(time)
	return {
		lon: hours * DRIFT_DEG_PER_HOUR * speedFactor,
		lat: hours * DRIFT_DEG_PER_HOUR * speedFactor * 0.35
	}
}

const distanceToCity = (lon: number, lat: number): number =>
	Math.hypot(lon - CITY.lon, lat - CITY.lat)

function temperatureAt(lon: number, lat: number, time: number): number {
	const hours = hoursOfDay(time)

	const diurnal = 7.5 * Math.sin((2 * Math.PI * (hours - 9.5)) / 24)
	const valley = 18.5 + diurnal
	const relief = -8 * southness(lat) ** 1.6
	const cityHeat = 2.6 * gaussian(distanceToCity(lon, lat), CITY_SIGMA)

	const offset = drift(time, 0.9)
	const texture =
		1.7 * signedFbm2D((lon - offset.lon) * 6, (lat - offset.lat) * 6, SEED.temperature, 4)
	const mesoscale = 1.2 * signedFbm2D(lon * 2.5, lat * 2.5, SEED.temperature + 9, 3)
	const micro = 0.7 * signedFbm2D((lon - offset.lon) * 16, (lat - offset.lat) * 16, SEED.temperature + 31, 3)

	return valley + relief + cityHeat + texture + mesoscale + micro
}

function windAt(lon: number, lat: number, time: number): number {
	const hours = hoursOfDay(time)
	const offset = drift(time)

	const base =
		2.2 + 4.2 * fbm2D((lon - offset.lon) * 5, (lat - offset.lat) * 5, SEED.wind, 3)
	const orographic =
		5.5 * southness(lat) * (0.4 + 0.6 * fbm2D(lon * 9, lat * 9, SEED.wind + 5, 2))
	const afternoon = 1.6 * clamp01(Math.sin((Math.PI * (hours - 10)) / 10))

	const gustiness = 0.75 + 0.55 * valueNoise2D(hours * 1.6, 0.5, SEED.wind + 21)

	return (base + orographic + afternoon) * gustiness
}

function insolationAt(lon: number, lat: number, time: number): number {
	const clearSky = 900 * sunHeight(hoursOfDay(time))
	const offset = drift(time, 1.8)
	const cloud = clamp01(
		fbm2D((lon - offset.lon) * 7, (lat - offset.lat) * 7, SEED.insolation, 4) * 1.45 - 0.3
	)

	return clearSky * (1 - 0.78 * cloud ** 1.5)
}

function windDirectionAt(lon: number, lat: number, time: number): number {
	const offset = drift(time, 1.1)
	const turn = signedFbm2D((lon - offset.lon) * 3, (lat - offset.lat) * 3, SEED.wind + 41, 3)
	const degrees = 220 + 75 * turn
	return ((degrees % 360) + 360) % 360
}

function valueAt(layerId: LayerId, time: number, lon: number, lat: number): number {
	switch (layerId) {
		case 'temperature':
			return temperatureAt(lon, lat, time)
		case 'wind':
			return windAt(lon, lat, time)
		case 'insolation':
			return insolationAt(lon, lat, time)
	}
}

function valueBounds(values: number[]): ValueBounds {
	let min = Number.POSITIVE_INFINITY
	let max = Number.NEGATIVE_INFINITY
	for (const value of values) {
		min = Math.min(min, value)
		max = Math.max(max, value)
	}
	return {min: round(min, 1), max: round(max, 1)}
}

export function buildFrame(layerId: LayerId, time: number): LayerFrame {
	const {cellStep, range} = LAYER_REGISTRY[layerId]
	const cells: LayerCell[] = []

	for (let lon = REGION_BOUNDS.west + cellStep.lon / 2; lon < REGION_BOUNDS.east; lon += cellStep.lon) {
		for (let lat = REGION_BOUNDS.south + cellStep.lat / 2; lat < REGION_BOUNDS.north; lat += cellStep.lat) {
			const cell: LayerCell = {
				lon: round(lon, 5),
				lat: round(lat, 5),
				stepLon: cellStep.lon,
				stepLat: cellStep.lat,
				value: round(clamp(valueAt(layerId, time, lon, lat), range.min, range.max), 2)
			}

			if (layerId === 'wind') {
				cell.direction = round(windDirectionAt(lon, lat, time), 1)
			}

			cells.push(cell)
		}
	}

	return {layerId, time, bounds: valueBounds(cells.map(cell => cell.value)), cells}
}

export function buildSeries(layerId: LayerId): LayerSeries {
	const points = TIME_POINTS.map(time => {
		const frame = buildFrame(layerId, time)
		const sum = frame.cells.reduce((acc, cell) => acc + cell.value, 0)
		return {time, value: round(frame.cells.length > 0 ? sum / frame.cells.length : 0, 2)}
	})

	return {layerId, bounds: valueBounds(points.map(point => point.value)), points}
}
