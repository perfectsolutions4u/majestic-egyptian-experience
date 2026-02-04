import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    // Use HashLocationStrategy for SSR to avoid 404 errors on refresh
    // This ensures all routes work correctly in production/SSR builds
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    // Client hydration is required for SSR to work properly
    provideClientHydration(withEventReplay()),
    // Using provideServerRendering with serverRoutes to explicitly configure
    // dynamic routes with RenderMode.Server. This prevents Angular SSR from trying
    // to prerender dynamic routes (which require getPrerenderParams) and instead
    // renders them on-demand when requested.
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
