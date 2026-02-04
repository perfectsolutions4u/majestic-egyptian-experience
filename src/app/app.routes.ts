import { Routes } from '@angular/router';
import { authRoutes } from './modules/auth/auth.routes';
import { dataRoutes } from './modules/data/data.routes';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Home',
  },
  // Auth routes
  ...authRoutes,
  // Data routes
  ...dataRoutes,
  // Not found
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Not Found Page',
  },
];
