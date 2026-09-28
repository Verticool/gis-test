import type {ReactNode} from 'react'

type Props = {
	children: ReactNode
	className?: string
}

export function Surface({ children, className = '' }: Props) {
	return (
		<div
			className={`rounded-lg border border-line/70 bg-surface/90 shadow-sm backdrop-blur-sm ${className}`}
		>
			{children}
		</div>
	)
}
