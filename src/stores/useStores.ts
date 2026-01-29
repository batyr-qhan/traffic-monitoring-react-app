import { useContext } from "react";
import { StoreContext } from "./index";

export function useStores() {
	const stores = useContext(StoreContext);
	if (!stores) {
		throw new Error("useStores must be used within a StoreProvider");
	}
	return stores;
}
