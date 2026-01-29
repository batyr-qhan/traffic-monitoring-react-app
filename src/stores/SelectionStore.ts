import { makeAutoObservable } from "mobx";

export class SelectionStore {
	selectedPointId: number | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	selectPoint(id: number) {
		this.selectedPointId = id;
	}

	clearSelection() {
		this.selectedPointId = null;
	}
}
