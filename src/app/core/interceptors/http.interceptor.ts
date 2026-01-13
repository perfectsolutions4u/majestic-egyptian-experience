import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const spinner = inject(NgxSpinnerService);

  // Clone the request
  let clonedRequest = req.clone();

  // Add X-LOCALIZE header with language code
  if (isPlatformBrowser(platformId)) {
    const language = localStorage.getItem('language') || 'en';
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        'X-LOCALIZE': language,
      },
    });
  } else {
    // For SSR, use default language
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        'X-LOCALIZE': 'en',
      },
    });
  }

  // Add Authorization header with token if user is logged in
  const token = authService.getToken();
  if (token) {
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Show spinner only in browser (not in SSR to avoid errors)
  if (isPlatformBrowser(platformId)) {
    try {
      spinner.show();
    } catch (error) {
      // Ignore spinner errors
      console.warn('Spinner error:', error);
    }
  }

  // Handle the request and hide spinner when done
  return next(clonedRequest).pipe(
    finalize(() => {
      if (isPlatformBrowser(platformId)) {
        try {
          spinner.hide();
        } catch (error) {
          // Ignore spinner errors
          console.warn('Spinner error:', error);
        }
      }
    })
  );
};
