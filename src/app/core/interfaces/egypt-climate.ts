/**
 * Monthly climate data for a single governorate (from Open-Meteo archive, aggregated).
 */
export interface EgyptMonthlyClimate {
  month: string;
  monthId: number;
  avgTempMax: number;
  avgTempMin: number;
  rainfall: number;
  uvIndex: number;
}

/**
 * Governorate definition with coordinates for Open-Meteo API.
 * Add new governorates here to extend the climate guide.
 */
export interface EgyptGovernorate {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Full climate response for one governorate (12 months).
 */
export type EgyptClimateResponse = EgyptMonthlyClimate[];
