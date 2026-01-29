import { useQuery } from "@tanstack/react-query";
import { fetchDtpData } from "../services/api";

export function useDtpData() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["dtpData"],
		queryFn: fetchDtpData,
	});

	return { data, isLoading, error };
}
