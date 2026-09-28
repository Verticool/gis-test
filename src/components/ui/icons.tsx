type IconProps = {
	className?: string
}

const base = {
	fill: 'none',
	stroke: 'currentColor',
	strokeLinecap: 'round' as const,
	strokeLinejoin: 'round' as const,
	strokeWidth: 1.7
}

export function ThermometerIcon({className}: IconProps) {
	return (
		<svg aria-hidden='true' className={className} viewBox='0 0 24 24' {...base}>
			<path d='M14 13.6V6a2 2 0 1 0-4 0v7.6a4 4 0 1 0 4 0Z' />
			<circle cx='12' cy='17' fill='currentColor' r='1.5' stroke='none' />
		</svg>
	)
}

export function WindIcon({className}: IconProps) {
	return (
		<svg aria-hidden='true' className={className} viewBox='0 0 24 24' {...base}>
			<path d='M3 8h9.5a2.5 2.5 0 1 0-2.5-2.5' />
			<path d='M3 12h13a2.5 2.5 0 1 1-2.5 2.5' />
			<path d='M3 16h6' />
		</svg>
	)
}

export function SunIcon({className}: IconProps) {
	return (
		<svg aria-hidden='true' className={className} viewBox='0 0 24 24' {...base}>
			<circle cx='12' cy='12' r='4' />
			<path d='M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4' />
		</svg>
	)
}

export function ChevronIcon({className}: IconProps) {
	return (
		<svg aria-hidden='true' className={className} viewBox='0 0 24 24' {...base}>
			<path d='m6 9 6 6 6-6' />
		</svg>
	)
}

export function RefreshIcon({className}: IconProps) {
	return (
		<svg aria-hidden='true' className={className} viewBox='0 0 24 24' {...base}>
			<path d='M20.5 12a8.5 8.5 0 1 1-2.6-6.1' />
			<path d='M20.5 4v5.5H15' />
		</svg>
	)
}
