import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  constructor(protected HttpClient: HttpClient) {}
  protected baseUrl = environment.apiUrl;
}
