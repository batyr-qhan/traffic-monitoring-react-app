import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";

interface UseMapSetupOptions {
	container: HTMLDivElement | null;
	onMapReady?: (map: maplibregl.Map) => void;
}

export function useMapSetup({ container, onMapReady }: UseMapSetupOptions) {
	const mapRef = useRef<maplibregl.Map | null>(null);

	useEffect(() => {
		if (mapRef.current || !container) return;

		mapRef.current = new maplibregl.Map({
			container,
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
			},
			center: [71.4491, 51.1694], // Center on Astana
			zoom: 10,
			scrollZoom: false,
		});

		mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

		if (onMapReady) {
			onMapReady(mapRef.current);
		}

		return () => {
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, [container, onMapReady]);

	return mapRef;
}
