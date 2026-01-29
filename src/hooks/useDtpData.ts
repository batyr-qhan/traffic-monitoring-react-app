import { useQuery } from "@tanstack/react-query";
import { fetchDtpData } from "../services/api";

export function useDtpData() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["dtpData"],
		queryFn: fetchDtpData,
		retry: 2,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	return { data, isLoading, error };
}
