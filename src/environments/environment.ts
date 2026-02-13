// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://tourism-api.perfectsolutions4u.com/api',
  /** Open-Meteo archive API: use proxy in dev to avoid CORS */
  openMeteoArchiveUrl: '/api/open-meteo-archive',
};
