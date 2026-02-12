import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class BookingService extends BaseService {
  constructor(protected override HttpClient: HttpClient) {
    super(HttpClient);
  }

  appendBookingData(bookingData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/bookings`, bookingData);
  }

  appendBookingCartData(bookingData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/cart/tours/append`, bookingData);
  }

  getCartList(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/cart/list`);
  }

  deleteTourCart(tourCartId: number): Observable<any> {
    return this.HttpClient.delete(`${this.baseUrl}/cart/remove/${tourCartId}`);
  }

  clearTourCart(): Observable<any> {
    return this.HttpClient.delete(`${this.baseUrl}/cart/clear`);
  }

  sendCheckoutData(checkoutData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/checkout`, checkoutData);
  }

  getCoupon(couponCode: string): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/coupons/${couponCode}`);
  }

  getCountries(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/countries`);
  }
}
