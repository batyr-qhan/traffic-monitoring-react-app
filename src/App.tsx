import { observer } from "mobx-react-lite";
import { useRef } from "react";
import "./App.css";
import "maplibre-gl/dist/maplibre-gl.css";
import {
	useCityBorders,
	useCityBordersLayer,
	useDtpData,
	useMapSetup,
	useTrafficLayer,
} from "./hooks";
import { useStores } from "./stores/useStores";

const AppContent = observer(() => {
	const { uiStore, selectionStore } = useStores();
	const mapContainer = useRef<HTMLDivElement>(null);

	const mapRef = useMapSetup({
		container: mapContainer.current,
	});

	const {
		data: dtpData,
		isLoading: isDtpLoading,
		error: dtpError,
	} = useDtpData();
	const {
		data: cityBorders,
		isLoading: isCityBordersLoading,
		error: cityBordersError,
	} = useCityBorders();

	const isLoading = isDtpLoading || isCityBordersLoading;
	const hasError = dtpError || cityBordersError;

	useTrafficLayer({
		map: mapRef.current,
		dtpData,
		selectedPointId: selectionStore.selectedPointId,
		onPointSelected: (id) => selectionStore.selectPoint(id),
		showClusters: uiStore.showClusters,
		showPoints: uiStore.showPoints,
	});

	useCityBordersLayer({
		map: mapRef.current,
		cityBorders,
		showBorders: uiStore.showBorders,
	});

	return (
		<div className="wrapper">
			<header className="app-header">
				<h1>Traffic Accidents in Astana</h1>
				{isLoading && (
					<p style={{ margin: "8px 0", color: "#666" }}>Loading data...</p>
				)}
				{hasError && <p style={{ color: "red" }}>Error loading data</p>}
				<div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
					<label>
						<input
							type="checkbox"
							checked={uiStore.showPoints}
							onChange={(e) => uiStore.setShowPoints(e.target.checked)}
						/>
						Show Points
					</label>
					<label>
						<input
							type="checkbox"
							checked={uiStore.showClusters}
							onChange={(e) => uiStore.setShowClusters(e.target.checked)}
						/>
						Show Clusters
					</label>
					<label>
						<input
							type="checkbox"
							checked={uiStore.showBorders}
							onChange={(e) => uiStore.setShowBorders(e.target.checked)}
						/>
						Show Borders
					</label>
				</div>
			</header>
			<div className="map-container" ref={mapContainer} />
		</div>
	);
});

function App() {
	return <AppContent />;
}

export default App;
