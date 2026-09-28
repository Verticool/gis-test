import {MapView} from './MapView'
import {LayerSwitcher} from './LayerSwitcher'

export function MapPanel() {
	return (
		<section className='relative min-h-0 flex-1 overflow-hidden bg-canvas'>
			<MapView />

			<div className='pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-2 sm:p-3 [&_*]:pointer-events-auto'>
				<LayerSwitcher />
			</div>
		</section>
	)
}
