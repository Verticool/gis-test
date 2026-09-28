import type {ReactNode} from 'react'

export type SegmentState = 'idle' | 'loading' | 'ready' | 'error'

export type Segment<T extends string> = {
	value: T
	label: string
	icon?: ReactNode

	state?: SegmentState
}

type Props<T extends string> = {
	items: readonly Segment<T>[]
	value: T | null
	onChange: (value: T) => void
}

const tone = (active: boolean, state: SegmentState): string => {
	if (state === 'error') {
		return 'text-danger'
	}
	return active
		? 'bg-ink text-surface'
		: 'text-ink-muted hover:bg-surface hover:text-ink'
}

export function SegmentedControl<T extends string>({items, value, onChange}: Props<T>) {
	return (
		<div className='flex items-center gap-0.5'>
			{items.map(item => {
				const active = item.value === value
				const state = item.state ?? 'idle'

				return (
					<button
						aria-busy={state === 'loading'}
						aria-label={item.label}
						aria-pressed={active}
						className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors duration-150 sm:px-2.5 ${tone(
							active,
							state
						)}`}
						key={item.value}
						onClick={() => onChange(item.value)}
						title={item.label}
						type='button'
					>

						<span
							className={`flex items-center gap-1.5 ${state === 'loading' ? 'animate-pulse' : ''}`}
						>
							{item.icon ?? null}
							<span className='hidden sm:inline'>{item.label}</span>
						</span>
					</button>
				)
			})}
		</div>
	)
}
