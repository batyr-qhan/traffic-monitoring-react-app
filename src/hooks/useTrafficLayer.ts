import maplibregl from "maplibre-gl";
import { useEffect } from "react";

interface UseTrafficLayerOptions {
	map: maplibregl.Map | null;
	dtpData: GeoJSON.FeatureCollection | undefined;
	selectedPointId: number | null;
	onPointSelected: (id: number) => void;
	showClusters: boolean;
	showPoints: boolean;
}

export function useTrafficLayer({
	map,
	dtpData,
	selectedPointId,
	onPointSelected,
	showClusters,
	showPoints,
}: UseTrafficLayerOptions) {
	useEffect(() => {
		if (!map || !dtpData) return;

		if (map.getSource("traffic-accidents")) {
			(map.getSource("traffic-accidents") as maplibregl.GeoJSONSource).setData(
				dtpData,
			);

			// Update layer paint when selectedPointId changes
			map.setPaintProperty("traffic-accidents-layer", "circle-color", [
				"case",
				["==", ["id"], selectedPointId],
				"#ff0000", // Red for selected
				"#008000", // Green for unselected
			]);

			map.setPaintProperty("traffic-accidents-layer", "circle-radius", [
				"case",
				["==", ["id"], selectedPointId],
				8, // Larger for selected
				5, // Normal for unselected
			]);
		} else {
			map.addSource("traffic-accidents", {
				type: "geojson",
				data: dtpData,
				cluster: true,
				clusterMaxZoom: 14,
				clusterRadius: 50,
			});

			// Clustered circles
			map.addLayer({
				id: "clusters",
				type: "circle",
				source: "traffic-accidents",
				filter: ["has", "point_count"],
				paint: {
					"circle-color": [
						"step",
						["get", "point_count"],
						"#51bbd6",
						5,
						"#f1f075",
						10,
						"#f28cb1",
					],
					"circle-radius": ["step", ["get", "point_count"], 20, 5, 30, 10, 40],
				},
			});

			// Cluster count labels
			map.addLayer({
				id: "cluster-count",
				type: "symbol",
				source: "traffic-accidents",
				filter: ["has", "point_count"],
				layout: {
					"text-field": "{point_count_abbreviated}",
					"text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
					"text-size": 12,
				},
			});

			map.addLayer({
				id: "traffic-accidents-layer",
				type: "circle",
				source: "traffic-accidents",
				filter: ["!", ["has", "point_count"]],
				paint: {
					"circle-radius": ["case", ["==", ["id"], selectedPointId], 8, 5],
					"circle-color": [
						"case",
						["==", ["id"], selectedPointId],
						"#ff0000",
						"#008000",
					],
					"circle-stroke-width": 2,
					"circle-stroke-color": "#ffffff",
				},
			});

			// Zoom in on cluster click
			map.on("click", "clusters", (e) => {
				const features = map.querySourceFeatures("traffic-accidents", {
					filter: ["has", "point_count"],
				});
				const clickedFeature = features.find(
					(f) =>
						f.properties?.["cluster_id"] ===
						(e.features?.[0].properties?.["cluster_id"] || null),
				);

				if (clickedFeature) {
					const zoom = map.getZoom();
					map.easeTo({
						center: e.lngLat,
						zoom: zoom + 2,
					});
				}
			});

			// Hover effect on clusters
			map.on("mouseenter", "clusters", () => {
				map.getCanvas().style.cursor = "pointer";
			});
			map.on("mouseleave", "clusters", () => {
				map.getCanvas().style.cursor = "";
			});

			// Click on individual points to show popup
			map.on("click", "traffic-accidents-layer", (e) => {
				if (e.features && e.features.length > 0) {
					const feature = e.features[0];
					const properties = feature.properties;
					const id = feature.id;

					onPointSelected(id as number);

					const popupHTML = `
                        <div class="popup-content">
                            <h3>Accident Details</h3>
                            <p><strong>ID:</strong> ${id || "N/A"}</p>
                            <p><strong>Time:</strong> ${properties?.fd1r05p1 || "N/A"}</p>
                        </div>
                    `;

					new maplibregl.Popup()
						.setLngLat(e.lngLat)
						.setHTML(popupHTML)
						.addTo(map);
				}
			});

			// Change cursor on hover over individual points
			map.on("mouseenter", "traffic-accidents-layer", () => {
				map.getCanvas().style.cursor = "pointer";
			});
			map.on("mouseleave", "traffic-accidents-layer", () => {
				map.getCanvas().style.cursor = "";
			});
		}

		// Handle visibility toggles
		if (map.getLayer("clusters")) {
			map.setLayoutProperty(
				"clusters",
				"visibility",
				showClusters ? "visible" : "none",
			);
		}
		if (map.getLayer("cluster-count")) {
			map.setLayoutProperty(
				"cluster-count",
				"visibility",
				showClusters ? "visible" : "none",
			);
		}
		if (map.getLayer("traffic-accidents-layer")) {
			map.setLayoutProperty(
				"traffic-accidents-layer",
				"visibility",
				showPoints ? "visible" : "none",
			);
		}
	}, [dtpData, selectedPointId, map, onPointSelected, showClusters, showPoints]);
}
