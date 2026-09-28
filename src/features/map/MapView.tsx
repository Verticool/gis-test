import 'ol/ol.css'
import {useEffect, useRef} from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import {getCenter} from 'ol/extent'
import {getLayerDescriptor} from '@/config/layers'
import {DEFAULT_BASEMAP, createBaseLayer} from '@/lib/map/basemap'
import {createFrameLayer} from '@/lib/map/frameLayer'
import {REGION_EXTENT} from '@/lib/map/region'
import {readActiveLayerId, readLayerFrame, useAppStore} from '@/stores'
import type {AppStore} from '@/stores'
import type {FrameLayer} from '@/lib/map/frameLayer'

function paint(store: AppStore, frameLayer: FrameLayer): void {
	const id = readActiveLayerId(store)
	const frame = readLayerFrame(store, id)

	if (frame === null) {
		frameLayer.clear()
		return
	}

	frameLayer.render(frame, getLayerDescriptor(id))
}

export function MapView() {
	const store = useAppStore()
	const container = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!container.current) {
			return
		}

		const frameLayer = createFrameLayer()
		const map = new Map({
			layers: [createBaseLayer(), ...frameLayer.layers],
			target: container.current,
			view: new View({
				center: getCenter(REGION_EXTENT),
				constrainResolution: false,
				maxZoom: DEFAULT_BASEMAP.maxZoom,
				minZoom: 6,
				zoom: 9
			})
		})

		const padding = container.current.clientWidth < 640 ? 20 : 56
		map.getView().fit(REGION_EXTENT, {duration: 0, padding: [padding, padding, padding, padding]})

		const sync = (): void => paint(store, frameLayer)
		const stop = [store.on('activeLayerId', sync), store.on('frameById', sync)]
		sync()

		return () => {
			stop.forEach(off => off())

			map.setTarget(undefined)
		}
	}, [store])

	return <div className='absolute inset-0' ref={container} />
}
