import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  userdata: any;

  constructor(
    protected override HttpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(HttpClient);
  }

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  saveToken(token: string) {
    if (this.isBrowser) {
      localStorage.setItem('accessToken', token);
    }
  }
  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('accessToken') : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('accessToken');
      // مسح favouriteIds عند تسجيل الخروج
      localStorage.removeItem('favouriteIds');
    }
    this.userdata = null;
  }

  setRegister(userData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/auth/register`, userData);
  }

  setlogin(userData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/auth/login`, userData);
  }

  setForgetPass(userEmail: any): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/auth/password/forget`, {
      email: userEmail,
    });
  }

  setOTP(userData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/auth/password/otp/verify`, userData);
  }
}
