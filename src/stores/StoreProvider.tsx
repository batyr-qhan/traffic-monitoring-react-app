import type { ReactNode } from "react";
import { StoreContext, uiStore, selectionStore } from "./index";

interface StoreProviderProps {
	children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
	return (
		<StoreContext.Provider value={{ uiStore, selectionStore }}>
			{children}
		</StoreContext.Provider>
	);
}
