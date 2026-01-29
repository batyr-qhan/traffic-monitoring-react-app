import { makeAutoObservable } from "mobx";

export class UIStore {
	showPoints = true;
	showClusters = true;
	showBorders = true;

	constructor() {
		makeAutoObservable(this);
	}

	togglePoints() {
		this.showPoints = !this.showPoints;
	}

	toggleClusters() {
		this.showClusters = !this.showClusters;
	}

	toggleBorders() {
		this.showBorders = !this.showBorders;
	}

	setShowPoints(value: boolean) {
		this.showPoints = value;
	}

	setShowClusters(value: boolean) {
		this.showClusters = value;
	}

	setShowBorders(value: boolean) {
		this.showBorders = value;
	}
}
