import { createContext } from "react";
import { SelectionStore } from "./SelectionStore";
import { UIStore } from "./UIStore";

export const uiStore = new UIStore();
export const selectionStore = new SelectionStore();

export const StoreContext = createContext<{
	uiStore: UIStore;
	selectionStore: SelectionStore;
} | null>(null);
