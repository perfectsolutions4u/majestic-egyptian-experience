import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProfileService extends BaseService {
  // profile
  getProfile(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/profile/me`);
  }

  updateProfile(data: any): Observable<any> {
    return this.HttpClient.patch(`${this.baseUrl}/profile`, data);
  }

  updateImageProfile(image: FormData): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/profile/change/image`, image);
  }

  logoutProfile(): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/profile/logout`, {});
  }
}
