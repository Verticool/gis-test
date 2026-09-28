import {useEffect} from 'react'
import {syncData, warmUp} from './actions'
import {useAppSelector, useAppStore} from './appStore'
import {selectActiveLayerId, selectSelectedTime} from './selectors'

export function useDataSync(): void {
	const store = useAppStore()
	const layerId = useAppSelector(selectActiveLayerId)
	const selectedTime = useAppSelector(selectSelectedTime)

	useEffect(() => {
		syncData(store)
	}, [store, layerId, selectedTime])

	useEffect(() => {
		const timer = window.setTimeout(() => warmUp(store), 500)
		return () => window.clearTimeout(timer)
	}, [store, selectedTime])
}
