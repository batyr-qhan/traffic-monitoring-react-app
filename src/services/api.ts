import { API_URL, CITY_BORDERS_URL } from "../constants/api";

export async function fetchDtpData() {
	const response = await fetch(API_URL);
	return response.json();
}

export async function fetchCityBorders() {
	const response = await fetch(CITY_BORDERS_URL);
	return response.json();
}
