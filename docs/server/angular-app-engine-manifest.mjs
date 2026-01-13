
export default {
  basePath: '/majestic-egyptian-experience',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
