import {SegmentedControl} from '@/components/ui/SegmentedControl'
import {Surface} from '@/components/ui/Surface'
import {RefreshIcon} from '@/components/ui/icons'
import {LAYER_IDS, getLayerDescriptor} from '@/config/layers'
import {
	selectActiveFrameView,
	selectActiveLayerId,
	selectLayer,
	retryLayer,
	useAppSelector,
	useAppStore
} from '@/stores'
import {LAYER_ICONS} from './layerIcons'

export function LayerSwitcher() {
	const store = useAppStore()
	const activeLayerId = useAppSelector(selectActiveLayerId)
	const frame = useAppSelector(selectActiveFrameView)

	const items = LAYER_IDS.map(id => {
		const Icon = LAYER_ICONS[id]
		return {
			value: id,
			label: getLayerDescriptor(id).label,
			icon: <Icon className='size-4' />,
			state: id === activeLayerId ? frame.status : ('idle' as const)
		}
	})

	return (
		<Surface className='flex items-center gap-1 p-1'>
			<SegmentedControl
				items={items}
				onChange={id => selectLayer(store, id)}
				value={activeLayerId}
			/>
			{frame.status === 'error' ? (
				<button
					aria-label='Повторить загрузку'
					className='flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10'
					onClick={() => retryLayer(store, frame.id)}
					title={frame.error ?? 'Повторить загрузку'}
					type='button'
				>
					<RefreshIcon className='size-3.5' />
				</button>
			) : null}
		</Surface>
	)
}
