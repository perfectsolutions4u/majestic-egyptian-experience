import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Set Content Security Policy headers to allow Chrome DevTools connections and external media
 * This fixes CSP violations for .well-known requests and video/media loading
 */
app.use((req, res, next) => {
  // Set CSP for both development and production
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; media-src 'self' https:;"
  );
  next();
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Handle Chrome DevTools .well-known requests
 * This must be before Angular routing to prevent CSP issues
 */
app.use('/.well-known', (req, res) => {
  res.status(404).end();
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 * This catch-all route ensures ALL requests (including invalid routes) are handled by Angular SSR.
 * 
 * Important: Angular's wildcard route (**) will catch all invalid routes and show 
 * the custom NotFoundComponent instead of the system 404 page.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
      } else {
        // This should not happen - Angular should always return a response
        // (even for 404s, it will return the NotFoundComponent via wildcard route)
        next();
      }
    })
    .catch((error) => {
      console.error('Angular SSR Error:', error);
      // On error, pass to next middleware (should not happen in normal operation)
      next(error);
    });
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
