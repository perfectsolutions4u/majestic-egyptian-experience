import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';

export type TripPayload = {
  destination?: string;
  fromDuration?: Date | string | null;
  ToDuration?: Date | string | null;
  appro?: number | string | null; // month (approx)
};
@Injectable({
  providedIn: 'root',
})
export class MakeTripService extends BaseService {
  constructor(protected override HttpClient: HttpClient) {
    super(HttpClient);
  }
  private makeTripSteps = new BehaviorSubject<TripPayload | null>(null);
  makeTripSteps$ = this.makeTripSteps.asObservable();

  setMakeTripSteps(data: TripPayload) {
    this.makeTripSteps.next(data);
  }
  getMakeTripSteps() {
    return this.makeTripSteps.value;
  }

  sendDataTrip(tripData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/custom/trips`, tripData);
  }
  getDestination(parent_id: any = 1): Observable<any> {
    let paramsId = new HttpParams();
    if (parent_id) {
      paramsId = paramsId.set('parent_id', parent_id);
    }

    return this.HttpClient.get(`${this.baseUrl}/destinations`, {
      params: paramsId,
    });
  }

  // getCountries(): Observable<any> {
  //   const fetchFn = () => this.HttpClient.get(`${this.baseUrl}/countries`);

  //   return this.getCachedOrFetch(this.STORAGE_KEYS.countries, 'countries', fetchFn);
  // }
}
