import type {ReactNode} from 'react'

type Props = {
	title: ReactNode
	hint?: ReactNode
	action?: ReactNode
	children: ReactNode
}

export function Panel({title, hint, action, children}: Props) {
	return (
		<section className='overflow-hidden rounded-lg border border-line bg-surface'>
			<header className='flex items-center gap-2 border-b border-line px-3 py-2.5'>
				<h2 className='flex items-center gap-2 text-sm font-medium text-ink'>{title}</h2>
				{hint === undefined ? null : (
					<span className='text-xs text-ink-muted tabular-nums'>{hint}</span>
				)}
				{action === undefined ? null : <span className='ml-auto'>{action}</span>}
			</header>
			{children}
		</section>
	)
}
