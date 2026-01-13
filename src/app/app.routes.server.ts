import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server routes configuration for Angular SSR.
 *
 * Dynamic routes (with parameters like :slug) are configured with RenderMode.Server
 * to enable on-demand server-side rendering, as we don't know all possible slugs at build time.
 *
 * Static routes can use RenderMode.Prerender if needed, but for simplicity,
 * we're using RenderMode.Server for all routes to ensure consistent behavior.
 */
export const serverRoutes: ServerRoute[] = [
  // Dynamic routes with parameters - must use RenderMode.Server
  {
    path: 'destination/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'tour/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Server,
  },
  // Wildcard route for 404 pages
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
