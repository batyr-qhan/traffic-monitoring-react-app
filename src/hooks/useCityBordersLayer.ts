import type maplibregl from "maplibre-gl";
import { useEffect } from "react";

interface UseCityBordersLayerOptions {
	map: maplibregl.Map | null;
	cityBorders: GeoJSON.FeatureCollection | undefined;
	showBorders: boolean;
}

export function useCityBordersLayer({
	map,
	cityBorders,
	showBorders,
}: UseCityBordersLayerOptions) {
	useEffect(() => {
		if (!map || !cityBorders) return;

		if (map.getSource("city-borders")) {
			(map.getSource("city-borders") as maplibregl.GeoJSONSource).setData(
				cityBorders,
			);
		} else {
			map.addSource("city-borders", {
				type: "geojson",
				data: cityBorders,
			});

			map.addLayer({
				id: "city-borders-layer",
				type: "fill",
				source: "city-borders",
				paint: {
					"fill-color": "#000000",
					"fill-opacity": 0.1,
				},
			});
		}

		// Handle visibility toggle
		if (map.getLayer("city-borders-layer")) {
			map.setLayoutProperty(
				"city-borders-layer",
				"visibility",
				showBorders ? "visible" : "none",
			);
		}
	}, [cityBorders, map, showBorders]);
}
