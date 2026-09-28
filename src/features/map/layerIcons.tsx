import type {ComponentType} from 'react'
import {SunIcon, ThermometerIcon, WindIcon} from '@/components/ui/icons'
import type {LayerId} from '@/types/gis'

export const LAYER_ICONS: Record<LayerId, ComponentType<{className?: string}>> = {
	temperature: ThermometerIcon,
	wind: WindIcon,
	insolation: SunIcon
}
