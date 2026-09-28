import {
	Area,
	AreaChart,
	CartesianGrid,
	ReferenceDot,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	usePlotArea,
	useXAxisInverseScale
} from 'recharts'
import type {TooltipContentProps} from 'recharts'

export interface ChartSeries {
	id: string
	label: string
	color: string
}

export interface TimeSeriesRow {
	time: number
	[seriesId: string]: number
}

interface TimeSeriesChartProps {
	series: ChartSeries
	rows: TimeSeriesRow[]

	selectedTime: number
	unit: string

	onSelectTime?: ((time: number) => void) | undefined
}

const formatTime = (value: number): string =>
	new Date(value).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})

const firstValue = (payload: ReadonlyArray<{value?: unknown}>): number | null => {
	const raw = payload[0]?.value
	return typeof raw === 'number' ? raw : null
}

function ChartTooltip({
	active,
	payload,
	label,
	color,
	label2,
	unit
}: TooltipContentProps & {color: string; label2: string; unit: string}) {
	if (active !== true || payload.length === 0) {
		return null
	}
	const value = firstValue(payload)

	return (
		<div className='rounded-md border border-line bg-surface px-2 py-1.5 text-xs shadow-sm'>
			<div className='text-ink-muted tabular-nums'>{formatTime(Number(label))}</div>
			<div className='mt-0.5 flex items-center gap-1.5'>
				<span className='size-2 rounded-full' style={{backgroundColor: color}} />
				<span>{label2}</span>
				<span className='font-medium tabular-nums'>
					{value === null ? '—' : `${value.toFixed(1)} ${unit}`}
				</span>
			</div>
		</div>
	)
}

function PlotTimePicker({onSelectTime}: {onSelectTime: (time: number) => void}) {
	const plotArea = usePlotArea()
	const inverseScale = useXAxisInverseScale()

	if (!plotArea || !inverseScale) {
		return null
	}

	return (
		<rect
			className='chart-time-picker'
			fill='transparent'
			height={plotArea.height}
			onClick={event => {
				const pixel = event.clientX - event.currentTarget.getBoundingClientRect().left
				const value = inverseScale(pixel)
				if (typeof value === 'number') {
					onSelectTime(value)
				}
			}}
			style={{cursor: 'crosshair'}}
			width={plotArea.width}
			x={plotArea.x}
			y={plotArea.y}
		/>
	)
}

function hourTicks(rows: TimeSeriesRow[]): number[] {
	const step = rows.length > 1 ? (rows[1]?.time ?? 0) - (rows[0]?.time ?? 0) : 0
	const stride = step > 0 ? Math.round(3_600_000 / step) : 4
	return rows.filter((_, index) => index % stride === 0).map(row => row.time)
}

export function TimeSeriesChart({
	series,
	rows,
	selectedTime,
	unit,
	onSelectTime
}: TimeSeriesChartProps) {
	const step = rows.length > 1 ? (rows[1]?.time ?? 0) - (rows[0]?.time ?? 0) : 0
	const gradientId = `series-fill-${series.id}`
	const selectedPoint = rows.find(row => row.time === selectedTime)?.[series.id]

	const values = rows
		.map(row => row[series.id])
		.filter((value): value is number => typeof value === 'number')
	const minValue = values.length > 0 ? Math.min(...values) : 0
	const maxValue = values.length > 0 ? Math.max(...values) : 1
	const spread = maxValue - minValue
	const padding = spread > 0 ? spread * 0.3 : Math.max(1, Math.abs(maxValue) * 0.05)
	const domain: [number, number] = [minValue - padding, maxValue + padding]

	const firstTime = rows[0]?.time ?? selectedTime
	const lastTime = rows[rows.length - 1]?.time ?? selectedTime
	const timeDomain: [number, number] = [
		firstTime - step / 2,
		lastTime + step / 2
	]

	return (
		<ResponsiveContainer height='100%' width='100%'>
			<AreaChart data={rows} margin={{bottom: 0, left: 0, right: 14, top: 10}}>
				<defs>
					<linearGradient id={gradientId} x1='0' x2='0' y1='0' y2='1'>
						<stop offset='0%' stopColor={series.color} stopOpacity={0.22} />
						<stop offset='100%' stopColor={series.color} stopOpacity={0.02} />
					</linearGradient>
				</defs>

				<CartesianGrid stroke='var(--color-line)' strokeDasharray='2 4' vertical={false} />
				<XAxis
					axisLine={false}
					dataKey='time'
					domain={timeDomain}
					tick={{fill: 'var(--color-ink-muted)', fontSize: 11}}
					tickFormatter={value => formatTime(Number(value))}
					tickLine={false}
					tickMargin={8}
					ticks={hourTicks(rows)}
					type='number'
				/>
				<YAxis
					axisLine={false}
					domain={domain}
					tick={{fill: 'var(--color-ink-muted)', fontSize: 11}}
					tickCount={4}
					tickFormatter={value => Number(value).toFixed(0)}
					tickLine={false}
					width={38}
				/>
				<Tooltip
					content={props => (
						<ChartTooltip
							{...props}
							color={series.color}
							label2={series.label}
							unit={unit}
						/>
					)}
					cursor={{stroke: 'var(--color-line)', strokeWidth: 1}}
				/>

				<ReferenceLine
					stroke='var(--color-accent)'
					strokeOpacity={0.45}
					strokeWidth={1.5}
					x={selectedTime}
				/>

				<Area
					activeDot={{
						fill: series.color,
						r: 3.5,
						stroke: 'var(--color-surface)',
						strokeWidth: 2
					}}
					dataKey={series.id}
					dot={false}
					fill={`url(#${gradientId})`}
					isAnimationActive={false}
					stroke={series.color}
					strokeWidth={2.4}
					type='monotone'
				/>

				{typeof selectedPoint === 'number' ? (
					<ReferenceDot
						fill={series.color}
						r={4.5}
						stroke='var(--color-surface)'
						strokeWidth={2}
						x={selectedTime}
						y={selectedPoint}
					/>
				) : null}

				{onSelectTime === undefined ? null : <PlotTimePicker onSelectTime={onSelectTime} />}
			</AreaChart>
		</ResponsiveContainer>
	)
}
