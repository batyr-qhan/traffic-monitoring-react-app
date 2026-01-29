import { useQuery } from "@tanstack/react-query";
import { fetchCityBorders } from "../services/api";

export function useCityBorders() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["cityBorders"],
		queryFn: fetchCityBorders,
	});

	return { data, isLoading, error };
}
