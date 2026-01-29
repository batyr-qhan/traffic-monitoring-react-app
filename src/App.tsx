import { useRef, useState } from "react";
import "./App.css";
import "maplibre-gl/dist/maplibre-gl.css";
import {
	useCityBorders,
	useCityBordersLayer,
	useDtpData,
	useMapSetup,
	useTrafficLayer,
} from "./hooks";

function App() {
	const mapContainer = useRef<HTMLDivElement>(null);
	const [selectedPointId, setSelectedPointId] = useState<number | null>(null);
	const [showPoints, setShowPoints] = useState(true);
	const [showClusters, setShowClusters] = useState(true);
	const [showBorders, setShowBorders] = useState(true);

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
		selectedPointId,
		onPointSelected: setSelectedPointId,
		showClusters,
		showPoints,
	});

	useCityBordersLayer({
		map: mapRef.current,
		cityBorders,
		showBorders,
	});

	return (
		<div className="wrapper">
			<header className="app-header">
				<h1>Traffic Accidents in Astana</h1>
				{isLoading && <p>Loading data...</p>}
				{hasError && <p style={{ color: "red" }}>Error loading data</p>}
				<div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
					<label>
						<input
							type="checkbox"
							checked={showPoints}
							onChange={(e) => setShowPoints(e.target.checked)}
						/>
						Show Points
					</label>
					<label>
						<input
							type="checkbox"
							checked={showClusters}
							onChange={(e) => setShowClusters(e.target.checked)}
						/>
						Show Clusters
					</label>
					<label>
						<input
							type="checkbox"
							checked={showBorders}
							onChange={(e) => setShowBorders(e.target.checked)}
						/>
						Show Borders
					</label>
				</div>
			</header>
			<div className="map-container" ref={mapContainer} />
		</div>
	);
}

export default App;
