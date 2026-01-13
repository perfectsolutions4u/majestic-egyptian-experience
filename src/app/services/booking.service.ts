import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService extends BaseService {
  // tour details
  appendBookingData(bookingForm: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/cart/tours/append`, bookingForm);
  }

  // cart
  getCartList(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/cart/list`);
  }

  deleteTourCart(tourCart: any): Observable<any> {
    return this.HttpClient.delete(`${this.baseUrl}/cart/remove/${tourCart}`);
  }

  clearTourCart(): Observable<any> {
    return this.HttpClient.delete(`${this.baseUrl}/cart/clear`);
  }

  //checkout coupon
  getCoupon(code: any): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/coupons/${code}/validate`);
  }

  sendCheckoutData(checkoutData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/bookings`, checkoutData);
  }

  // countries
  getCountries(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/countries`);
  }
}
