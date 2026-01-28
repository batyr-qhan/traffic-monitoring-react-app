import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useQuery } from "@tanstack/react-query";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const API_URL =
	"https://gis.kgp.kz/arcgis/rest/services/KPSSU/DTP/FeatureServer/0/query?where=area_code+%3D+%271971%27&objectIds=&time=&geometry=&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&timeReferenceUnknownClient=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=geojson";

const CITY_BORDERS_URL =
	"https://services8.arcgis.com/GyR85gR88mMqIY4t/ArcGIS/rest/services/Open_dataset_of_administrative_boundaries_of_Kazakhstan_WFL1/FeatureServer/1/query?where=name_en%3D%27Astana%27&objectIds=&geometry=&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&outDistance=&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&returnEnvelope=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&collation=&orderByFields=&groupByFieldsForStatistics=&returnAggIds=false&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnTrueCurves=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=";

function App() {
	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<maplibregl.Map | null>(null);
	const [selectedPointId, setSelectedPointId] = useState<number | null>(null);

	const { data: dtpData } = useQuery({
		queryKey: ["dtpData"],
		queryFn: async () => {
			const response = await fetch(API_URL);
			return response.json();
		},
	});

	console.log("dtpData", dtpData);

	const { data: cityBorders } = useQuery({
		queryKey: ["cityBorders"],
		queryFn: async () => {
			const response = await fetch(CITY_BORDERS_URL);
			return response.json();
		},
	});

	console.log("cityBorders", cityBorders);

	useEffect(() => {
		if (map.current || !mapContainer.current) return;

		map.current = new maplibregl.Map({
			container: mapContainer.current,
			// style: "https://demotiles.maplibre.org/style.json", // Default style

			style: {
				version: 8,
				sources: {
					osm: {
						type: "raster",
						tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
						tileSize: 256,
						attribution: "&copy; OpenStreetMap contributors",
					},
				},
				layers: [
					{
						id: "osm",
						type: "raster",
						source: "osm",
					},
				],
			}, // OpenStreetMap style
			center: [71.4491, 51.1694], // Center on Astana
			zoom: 10,
			scrollZoom: false,
		});

		map.current.addControl(new maplibregl.NavigationControl(), "top-right");

		return () => {
			if (map.current) {
				map.current.remove();
				map.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (!map.current || !dtpData) return;

		if (map.current.getSource("traffic-accidents")) {
			(
				map.current.getSource("traffic-accidents") as maplibregl.GeoJSONSource
			).setData(dtpData);

			 // Update layer paint when selectedPointId changes
            map.current.setPaintProperty("traffic-accidents-layer", "circle-color", [
                "case",
                ["==", ["id"], selectedPointId],
                "#ff0000", // Red for selected
                "#008000", // Green for unselected
            ]);

            map.current.setPaintProperty("traffic-accidents-layer", "circle-radius", [
                "case",
                ["==", ["id"], selectedPointId],
                8, // Larger for selected
                5, // Normal for unselected
            ]);
		} else {
			map.current.addSource("traffic-accidents", {
				type: "geojson",
				data: dtpData,
				cluster: true,
				clusterMaxZoom: 14,
				clusterRadius: 50,
			});

			// Clustered circles
			map.current.addLayer({
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
			map.current.addLayer({
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

			map.current.addLayer({
				id: "traffic-accidents-layer",
				type: "circle",
				source: "traffic-accidents",
				filter: ["!", ["has", "point_count"]],
				paint: {
					"circle-radius": [
						"case",
						["==", ["id"], selectedPointId],
						8, // Larger radius for selected point
						5, // Default radius for other points
					],
					"circle-color": [
						"case",
						["==", ["id"], selectedPointId],
						"#ff0000", // Highlight color for selected point
						"#008000", // Default color for other points
					],

					"circle-stroke-width": 2,
					"circle-stroke-color": "#ffffff",
				},
			});

			// Zoom in on cluster click
			map.current.on("click", "clusters", (e) => {
				const features = map.current!.querySourceFeatures("traffic-accidents", {
					filter: ["has", "point_count"],
				});
				const clickedFeature = features.find(
					(f) =>
						f.properties?.["cluster_id"] ===
						(e.features[0].properties?.["cluster_id"] || null),
				);

				if (clickedFeature && map.current) {
					const zoom = map.current.getZoom();
					map.current.easeTo({
						center: e.lngLat,
						zoom: zoom + 2,
					});
				}
			});

			// Hover effect on clusters
			map.current.on("mouseenter", "clusters", () => {
				map.current!.getCanvas().style.cursor = "pointer";
			});
			map.current.on("mouseleave", "clusters", () => {
				map.current!.getCanvas().style.cursor = "";
			});

			// Click on individual points to show popup
			map.current.on("click", "traffic-accidents-layer", (e) => {
				if (e.features && e.features.length > 0) {
					const feature = e.features[0];
					const properties = feature.properties;
					const id = feature.id;

					setSelectedPointId(id as number);

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
						.addTo(map.current!);
				}
			});

			// Change cursor on hover over individual points
			map.current.on("mouseenter", "traffic-accidents-layer", () => {
				map.current!.getCanvas().style.cursor = "pointer";
			});
			map.current.on("mouseleave", "traffic-accidents-layer", () => {
				map.current!.getCanvas().style.cursor = "";
			});
		}
	}, [dtpData, selectedPointId]);

	useEffect(() => {
		if (!map.current || !cityBorders) return;

		// Add city borders as a source
		if (map.current.getSource("city-borders")) {
			(
				map.current.getSource("city-borders") as maplibregl.GeoJSONSource
			).setData(cityBorders);
		} else {
			map.current.addSource("city-borders", {
				type: "geojson",
				data: cityBorders,
			});

			map.current.addLayer({
				id: "city-borders-layer",
				type: "fill",
				source: "city-borders",
				paint: {
					"fill-color": "#000000",
					"fill-opacity": 0.1,
				},
			});
		}
	}, [cityBorders]);

	console.log("Selected Point ID:", selectedPointId);

	return (
		<div style={{ height: "90vh", width: "90vw" }}>
			<div ref={mapContainer} style={{ height: "100%", width: "100%" }} />
		</div>
	);
}

export default App;
