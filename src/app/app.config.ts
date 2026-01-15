import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { httpInterceptor } from './core/interceptors/http.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideToastr } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Use HashLocationStrategy only in production to avoid 404 errors on refresh
    // In development, use PathLocationStrategy (default) for better dev experience
    // Production URLs will be: http://domain.com/#/route
    // Development URLs will be: http://localhost:4200/route (works with ng serve)
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy, // PathLocationStrategy : HashLocationStrategy
    },
    provideAnimations(), // Required for Angular Material animations and ngx-toastr
    provideNativeDateAdapter(), // Required for Angular Material Datepicker
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
    }), // Configure ngx-toastr
    provideHttpClient(withFetch(), withInterceptors([httpInterceptor])), // Required for TranslateHttpLoader and SSR compatibility
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),
    // Note: provideClientHydration is only needed for SSR
    // It's automatically added in app.config.server.ts for SSR builds
    // Removing it from here to avoid issues in development
    // Provide TranslateHttpLoader with configuration
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
    // Configure TranslateModule
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateHttpLoader,
        },
        fallbackLang: 'en',
      }),
      NgxSpinnerModule
    ),
  ],
};
