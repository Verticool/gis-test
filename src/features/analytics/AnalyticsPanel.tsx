import {useMemo, useState} from 'react'
import {Dot} from '@/components/ui/Dot'
import {Panel} from '@/components/ui/Panel'
import {ChevronIcon} from '@/components/ui/icons'
import {getLayerDescriptor} from '@/config/layers'
import {TIME_POINTS, formatTimePoint} from '@/config/time'
import {
	selectActiveLayerId,
	selectSelectedTime,
	selectSeriesById,
	setSelectedTime,
	useAppSelector,
	useAppStore
} from '@/stores'
import {TimeSeriesChart} from './TimeSeriesChart'
import {buildChartRows, valueAt} from './chartRows'

const withUnit = (value: number | null, unit: string): string =>
	value === null ? '—' : `${value.toFixed(1)} ${unit}`

export function AnalyticsPanel() {
	const store = useAppStore()
	const activeLayerId = useAppSelector(selectActiveLayerId)
	const selectedTime = useAppSelector(selectSelectedTime)
	const seriesById = useAppSelector(selectSeriesById)

	const [open, setOpen] = useState(true)

	const layer = getLayerDescriptor(activeLayerId)

	const rows = useMemo(
		() => buildChartRows([layer.id], seriesById, TIME_POINTS),
		[layer, seriesById]
	)

	return (
		<Panel
			action={
				<button
					aria-expanded={open}
					aria-label={open ? 'Свернуть график' : 'Развернуть график'}
					className='cursor-pointer text-ink-muted transition-colors hover:text-ink'
					onClick={() => setOpen(value => !value)}
					type='button'
				>
					<ChevronIcon className={`size-4 transition-transform ${open ? '' : 'rotate-180'}`} />
				</button>
			}
			hint={`${formatTimePoint(selectedTime)} · ${withUnit(valueAt(rows, selectedTime, layer.id), layer.unit)}`}
			title={
				<>
					<Dot color={layer.color} size={8} />
					{layer.label}
				</>
			}
		>
			{open ? (
				<div className='h-32 p-1 sm:h-40 lg:h-44'>
					<TimeSeriesChart
						onSelectTime={time => setSelectedTime(store, time)}
						rows={rows}
						selectedTime={selectedTime}
						series={{ color: layer.color, id: layer.id, label: layer.label }}
						unit={layer.unit}
					/>
				</div>
			) : null}
		</Panel>
	)
}
