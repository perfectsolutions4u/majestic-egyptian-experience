import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError, tap, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  EgyptGovernorate,
  EgyptMonthlyClimate,
  EgyptClimateResponse,
} from '../core/interfaces/egypt-climate';

/** Open-Meteo archive API response (daily) */
interface OpenMeteoDailyArchive {
  daily: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
    uv_index_max: (number | null)[];
  };
}

const TIMEZONE = 'Africa/Cairo';
const START_DATE = '2025-01-01';
const END_DATE = '2025-12-31';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Egypt weather service – isolated layer for Open-Meteo API.
 * Fetches daily archive data, aggregates to monthly averages, caches in memory.
 * No UI dependencies.
 */
@Injectable({ providedIn: 'root' })
export class EgyptWeatherService {
  /** In-memory cache: governorate id -> monthly climate data */
  private readonly cache = new Map<string, EgyptClimateResponse>();
  /** Pending requests to avoid duplicate API calls */
  private readonly pending = new Map<string, Observable<EgyptClimateResponse>>();

  /** Governorates with lat/lon – add more here to extend the guide */
  readonly governorates: EgyptGovernorate[] = [
    { id: 'cairo', name: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
    { id: 'alexandria', name: 'Alexandria', latitude: 31.2001, longitude: 29.9187 },
    { id: 'giza', name: 'Giza', latitude: 30.0131, longitude: 31.2089 },
    { id: 'luxor', name: 'Luxor', latitude: 25.6989, longitude: 32.6421 },
    { id: 'aswan', name: 'Aswan', latitude: 24.0908, longitude: 32.8994 },
    { id: 'hurghada', name: 'Hurghada', latitude: 27.2574, longitude: 33.8129 },
    { id: 'sharm-el-sheikh', name: 'Sharm El Sheikh', latitude: 27.9158, longitude: 34.3300 },
    { id: 'port-said', name: 'Port Said', latitude: 31.2565, longitude: 32.2841 },
    { id: 'ismailia', name: 'Ismailia', latitude: 30.5965, longitude: 32.2715 },
    { id: 'marsa-matrouh', name: 'Marsa Matrouh', latitude: 31.3525, longitude: 27.2453 },
    { id: 'sinai', name: 'Sinai', latitude: 29.5577, longitude: 34.5853 },
    { id: 'fayoum', name: 'Fayoum', latitude: 29.5777, longitude: 30.8517 },
    { id: 'dakahlia', name: 'Dakahlia', latitude: 31.0167, longitude: 31.4167 },
    { id: 'daqahliyya', name: 'Daqahliyya', latitude: 31.2167, longitude: 30.5833 },
    { id: 'kafr-el-sheikh', name: 'Kafr El Sheikh', latitude: 31.0833, longitude: 30.9333 },
    { id: 'gharbia', name: 'Gharbia', latitude: 30.4167, longitude: 31.2500 },
    { id: 'monufia', name: 'Monufia', latitude: 30.5833, longitude: 31.3167 },
    { id: 'beheira', name: 'Beheira', latitude: 30.5667, longitude: 31.1500 },
    { id: 'bani-suwayf', name: 'Bani Suwayf', latitude: 29.0833, longitude: 31.0667 },
    { id: 'qena', name: 'Qena', latitude: 26.1667, longitude: 32.7000 },
    { id: 'sohag', name: 'Sohag', latitude: 26.5667, longitude: 31.6833 },
    { id: 'qaliubiya', name: 'Qaliubiya', latitude: 30.9833, longitude: 31.5500 },
    { id: 'sharqia', name: 'Sharqia', latitude: 30.3333, longitude: 31.0833 },
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get governorate by id (slug). Returns undefined if not found.
   */
  getGovernorate(id: string): EgyptGovernorate | undefined {
    const slug = this.normalizeId(id);
    return this.governorates.find((g) => this.normalizeId(g.id) === slug);
  }

  /**
   * GET /api/egypt-weather/:governorate – returns structured monthly climate data.
   * Uses in-memory cache and deduplicates in-flight requests.
   */
  getClimateByGovernorate(governorateId: string): Observable<EgyptClimateResponse> {
    const id = this.normalizeId(governorateId);
    const gov = this.getGovernorate(id);
    if (!gov) {
      return of([]);
    }

    const cached = this.cache.get(id);
    if (cached) {
      return of(cached);
    }

    let pending$ = this.pending.get(id);
    if (pending$) {
      return pending$;
    }

    const req$ = this.fetchAndAggregate(gov).pipe(
      tap((data) => this.cache.set(id, data)),
      tap(() => this.pending.delete(id)),
      catchError(() => {
        this.pending.delete(id);
        return of([]);
      }),
    );
    this.pending.set(id, req$);
    return req$;
  }

  /**
   * Load climate for all governorates (e.g. for the full Egypt Climate Guide table).
   * Returns a map of governorate id -> monthly data. Optimizes by not refetching cached.
   */
  getAllGovernoratesClimate(): Observable<Map<string, EgyptClimateResponse>> {
    const requests: Record<string, Observable<EgyptClimateResponse>> = {};
    this.governorates.forEach((g) => {
      requests[g.id] = this.getClimateByGovernorate(g.id);
    });
    return forkJoin(requests).pipe(
      map((byId) => {
        const result = new Map<string, EgyptClimateResponse>();
        Object.keys(byId).forEach((id) => result.set(id, byId[id]));
        return result;
      }),
    );
  }

  /** Single fetch + aggregate for one governorate */
  private fetchAndAggregate(gov: EgyptGovernorate): Observable<EgyptClimateResponse> {
    const params = new HttpParams()
      .set('latitude', gov.latitude.toString())
      .set('longitude', gov.longitude.toString())
      .set('start_date', START_DATE)
      .set('end_date', END_DATE)
      .set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max')
      .set('timezone', TIMEZONE);

    const url = environment.openMeteoArchiveUrl;
    return this.http.get<OpenMeteoDailyArchive>(url, { params }).pipe(
      map((res) => this.aggregateDailyToMonthly(res)),
    );
  }

  /** Aggregate daily arrays into monthly: avg max/min temp, total rainfall, avg UV */
  private aggregateDailyToMonthly(res: OpenMeteoDailyArchive): EgyptClimateResponse {
    const { time, temperature_2m_max, temperature_2m_min, precipitation_sum, uv_index_max } =
      res.daily;
    const byMonth = new Map<
      number,
      { maxSum: number; maxN: number; minSum: number; minN: number; rain: number; uvSum: number; uvN: number }
    >();

    for (let i = 0; i < time.length; i++) {
      const date = new Date(time[i]);
      const monthId = date.getMonth() + 1; // 1–12
      if (!byMonth.has(monthId)) {
        byMonth.set(monthId, {
          maxSum: 0,
          maxN: 0,
          minSum: 0,
          minN: 0,
          rain: 0,
          uvSum: 0,
          uvN: 0,
        });
      }
      const row = byMonth.get(monthId)!;
      const vMax = temperature_2m_max[i];
      const vMin = temperature_2m_min[i];
      const rain = precipitation_sum[i];
      const uv = uv_index_max[i];
      if (vMax != null && !Number.isNaN(vMax)) {
        row.maxSum += vMax;
        row.maxN += 1;
      }
      if (vMin != null && !Number.isNaN(vMin)) {
        row.minSum += vMin;
        row.minN += 1;
      }
      if (rain != null && !Number.isNaN(rain)) row.rain += rain;
      if (uv != null && !Number.isNaN(uv)) {
        row.uvSum += uv;
        row.uvN += 1;
      }
    }

    const out: EgyptMonthlyClimate[] = [];
    for (let monthId = 1; monthId <= 12; monthId++) {
      const row = byMonth.get(monthId);
      out.push({
        month: MONTH_NAMES[monthId - 1],
        monthId,
        avgTempMax: row && row.maxN ? Math.round((row.maxSum / row.maxN) * 10) / 10 : 0,
        avgTempMin: row && row.minN ? Math.round((row.minSum / row.minN) * 10) / 10 : 0,
        rainfall: row ? Math.round(row.rain * 10) / 10 : 0,
        uvIndex: row && row.uvN ? Math.round((row.uvSum / row.uvN) * 10) / 10 : 0,
      });
    }
    return out;
  }

  private normalizeId(id: string): string {
    return id.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
  }
}
