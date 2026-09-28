import {REGION_BOUNDS} from '@/config/layers'
import {transformExtent} from 'ol/proj'

export const REGION_EXTENT = transformExtent(
	[REGION_BOUNDS.west, REGION_BOUNDS.south, REGION_BOUNDS.east, REGION_BOUNDS.north],
	'EPSG:4326',
	'EPSG:3857'
)
