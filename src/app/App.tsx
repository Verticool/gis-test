import {AppStoreProvider} from '@/stores'
import {Workspace} from './Workspace'

export function App() {
	return (
		<AppStoreProvider>
			<Workspace />
		</AppStoreProvider>
	)
}
