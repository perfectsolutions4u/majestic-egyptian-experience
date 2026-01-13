import { Injectable, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { BaseService } from './base.service';
import { Observable, of, tap } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DataService extends BaseService implements OnDestroy {
  private readonly STORAGE_KEYS = {
    destinations: 'majestic_destinations',
    settings: 'majestic_settings',
    countries: 'majestic_countries',
    durations: 'majestic_durations',
    categories: 'majestic_categories',
  };

  // Cache expiration time: 3 minutes in milliseconds
  private readonly CACHE_EXPIRATION_TIME = 6 * 60 * 1000; // 6 minutes

  // Flags to track if data has been fetched in current session
  private sessionFetchFlags = {
    destinations: false,
    settings: false,
    countries: false,
    durations: false,
    categories: false,
  };

  // Interval timers for auto-refresh
  private refreshIntervals: Map<string, any> = new Map();

  constructor(
    protected override HttpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(HttpClient);
    // Initialize auto-refresh intervals
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAutoRefresh();
    }
  }

  ngOnDestroy(): void {
    // Clear all intervals when service is destroyed
    this.refreshIntervals.forEach((interval) => {
      if (interval) {
        clearInterval(interval);
      }
    });
    this.refreshIntervals.clear();
  }

  // Helper method to get data from localStorage with timestamp
  getFromLocalStorage(key: string): { data: any; timestamp: number } | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return null;
      }
      const parsed = JSON.parse(item);
      // Handle both old format (without timestamp) and new format (with timestamp)
      if (parsed && typeof parsed === 'object' && 'data' in parsed && 'timestamp' in parsed) {
        return parsed;
      }
      // If old format, return null to force refresh
      return null;
    } catch (error) {
      console.warn(`Error reading from localStorage for key ${key}:`, error);
      return null;
    }
  }

  private setToLocalStorage(key: string, data: any): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      // Store data with timestamp
      const storageData = {
        data: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(storageData));
    } catch (error) {
      console.warn(`Error writing to localStorage for key ${key}:`, error);
    }
  }

  // Check if cached data is expired
  private isCacheExpired(cachedItem: { data: any; timestamp: number } | null): boolean {
    if (!cachedItem || !cachedItem.timestamp) {
      return true;
    }
    const now = Date.now();
    const age = now - cachedItem.timestamp;
    return age > this.CACHE_EXPIRATION_TIME;
  }

  // Initialize auto-refresh intervals for all cached data
  private initializeAutoRefresh(): void {
    const refreshFunctions: { key: string; fetchFn: () => void }[] = [
      {
        key: 'destinations',
        fetchFn: () => {
          const fetchFn = () => {
            let paramsId = new HttpParams().set('parent_id', 1).set('page', 1);
            return this.HttpClient.get(`${this.baseUrl}/destinations`, {
              params: paramsId,
            });
          };
          fetchFn()
            .pipe(
              tap((response) => {
                if (response) {
                  this.setToLocalStorage(this.STORAGE_KEYS.destinations, response);
                }
              })
            )
            .subscribe();
        },
      },
      {
        key: 'settings',
        fetchFn: () => {
          this.HttpClient.get(`${this.baseUrl}/settings`)
            .pipe(
              tap((response) => {
                if (response) {
                  this.setToLocalStorage(this.STORAGE_KEYS.settings, response);
                }
              })
            )
            .subscribe();
        },
      },
      {
        key: 'countries',
        fetchFn: () => {
          this.HttpClient.get(`${this.baseUrl}/countries`)
            .pipe(
              tap((response) => {
                if (response) {
                  this.setToLocalStorage(this.STORAGE_KEYS.countries, response);
                }
              })
            )
            .subscribe();
        },
      },
      {
        key: 'durations',
        fetchFn: () => {
          this.HttpClient.get(`${this.baseUrl}/durations`)
            .pipe(
              tap((response) => {
                if (response) {
                  this.setToLocalStorage(this.STORAGE_KEYS.durations, response);
                }
              })
            )
            .subscribe();
        },
      },
      {
        key: 'categories',
        fetchFn: () => {
          this.HttpClient.get(`${this.baseUrl}/categories`)
            .pipe(
              tap((response) => {
                if (response) {
                  this.setToLocalStorage(this.STORAGE_KEYS.categories, response);
                }
              })
            )
            .subscribe();
        },
      },
    ];

    // Set up intervals for each data type
    refreshFunctions.forEach(({ key, fetchFn }) => {
      const interval = setInterval(() => {
        fetchFn();
      }, this.CACHE_EXPIRATION_TIME);
      this.refreshIntervals.set(key, interval);
    });
  }

  private getCachedOrFetch(
    storageKey: string,
    sessionKey: keyof typeof this.sessionFetchFlags,
    fetchFn: () => Observable<any>
  ): Observable<any> {
    const cachedItem = this.getFromLocalStorage(storageKey);
    const isExpired = this.isCacheExpired(cachedItem);

    // If cache is expired or this is the first call in this session, fetch from API
    if (isExpired || !this.sessionFetchFlags[sessionKey]) {
      this.sessionFetchFlags[sessionKey] = true;

      return fetchFn().pipe(
        tap((response) => {
          if (response) {
            // Store the full response to maintain the structure
            this.setToLocalStorage(storageKey, response);
          }
        })
      );
    }

    // If already fetched in this session and cache is still valid, use cached data
    if (cachedItem && cachedItem.data) {
      // Return cached data with the same structure as API response
      // If cached data is already in API format { data: [...] }, return it as is
      // Otherwise, wrap it in the same format
      const cachedData = cachedItem.data;
      if (cachedData && typeof cachedData === 'object' && 'data' in cachedData) {
        return of(cachedData);
      }
      // For backward compatibility: if cached data is array, return it as is
      // Components should handle both formats
      return of(cachedData);
    }

    // Fallback: fetch from API if no cached data
    return fetchFn().pipe(
      tap((response) => {
        if (response) {
          this.setToLocalStorage(storageKey, response);
        }
      })
    );
  }

  // Method to clear all cached data (useful for logout or manual refresh)
  clearAllCache(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    // Reset session flags
    this.sessionFetchFlags = {
      destinations: false,
      settings: false,
      countries: false,
      durations: false,
      categories: false,
    };
  }

  // tours
  getTours(searchObj?: any, page: number = 1): Observable<any> {
    const params = {
      includes: 'destinations,categories,days,seo,options',
      ...searchObj,
      page: page,
    };
    return this.HttpClient.get(`${this.baseUrl}/tours`, { params: params });
  }

  // get tour by slug
  getTourBySlug(slug: string): Observable<any> {
    return this.HttpClient.get(
      `${this.baseUrl}/tours/${slug}?includes=destinations,categories,days,seo,options`
    );
  }

  // wishlist
  toggleWishlist(id: number): Observable<any> {
    return this.HttpClient.put(`${this.baseUrl}/wishlist/${id}/toggle`, {});
  }

  getWishlist(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/wishlist`);
  }

  // destinations
  getDestination(parent_id: any = 1, page: number = 1): Observable<any> {
    const fetchFn = () => {
      let paramsId = new HttpParams();
      if (parent_id) {
        paramsId = paramsId.set('parent_id', parent_id);
      }
      if (page) {
        paramsId = paramsId.set('page', page);
      }
      return this.HttpClient.get(`${this.baseUrl}/destinations`, {
        params: paramsId,
      });
    };

    return this.getCachedOrFetch(this.STORAGE_KEYS.destinations, 'destinations', fetchFn);
  }

  // get destination by slug
  getDestinationBySlug(slug: string): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/destinations/${slug}?includes=seo`);
  }

  // get categories
  getCategory(): Observable<any> {
    const fetchFn = () => this.HttpClient.get(`${this.baseUrl}/categories`);

    return this.getCachedOrFetch(this.STORAGE_KEYS.categories, 'categories', fetchFn);
  }

  getCategoryBySlug(slug: string): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/categories/${slug}`);
  }

  // settings
  getSetting(): Observable<any> {
    const fetchFn = () => this.HttpClient.get(`${this.baseUrl}/settings`);

    return this.getCachedOrFetch(this.STORAGE_KEYS.settings, 'settings', fetchFn);
  }

  // countries
  getCountries(): Observable<any> {
    const fetchFn = () => this.HttpClient.get(`${this.baseUrl}/countries`);

    return this.getCachedOrFetch(this.STORAGE_KEYS.countries, 'countries', fetchFn);
  }

  // durations
  getDurations(): Observable<any> {
    const fetchFn = () => this.HttpClient.get(`${this.baseUrl}/durations`);

    return this.getCachedOrFetch(this.STORAGE_KEYS.durations, 'durations', fetchFn);
  }

  // blogs
  getBlogs(page: number = 1): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/blogs?page=${page}`);
  }

  // get blog by slug
  getBlogBySlug(slug: string): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/blogs/${slug}`);
  }

  // get blog categories
  getBlogCategories(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/blog-categories`);
  }

  // get special blog categories 'id'
  getBlogCategoriesDetails(id: number): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/blog-categories/${id}`);
  }

  // faqs
  getFaqs(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/faqs`);
  }

  // tour reviews
  getreviews(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/tour-reviews`);
  }
  getreviewByTourId(tour_id: number): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/tour-reviews/${tour_id}`);
  }
  writeReview(tour_id: number, review: any): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/tour-reviews/${tour_id}`, review);
  }

  // send contact data
  sendContactData(contactData: any): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/contact-requests`, contactData);
  }
}
