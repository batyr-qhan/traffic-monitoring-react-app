import { useQuery } from "@tanstack/react-query";
import { fetchCityBorders } from "../services/api";

export function useCityBorders() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["cityBorders"],
		queryFn: fetchCityBorders,
		retry: 2,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	return { data, isLoading, error };
}
