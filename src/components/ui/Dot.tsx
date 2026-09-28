export function Dot({color, size = 8}: {color: string; size?: number}) {
	return (
		<span
			className='inline-block shrink-0 rounded-full'
			style={{backgroundColor: color, height: size, width: size}}
		/>
	)
}
