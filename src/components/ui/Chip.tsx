import type {ReactNode} from 'react'
import {Surface} from './Surface'

export function Chip({children}: {children: ReactNode}) {
	return (
		<Surface className='flex items-center gap-2 px-2.5 py-1.5 text-xs'>
			{children}
		</Surface>
	)
}
