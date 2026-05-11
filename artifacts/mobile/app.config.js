// eslint-disable-next-line @typescript-eslint/no-require-imports
const base = require('./app.json');

module.exports = {
  ...base,
  expo: {
    ...base.expo,
    extra: {
      // Shared proxy domain — used by the mobile app to reach the API server.
      // REPLIT_DEV_DOMAIN is injected by the Replit environment at build/start time.
      replitDevDomain: process.env.REPLIT_DEV_DOMAIN ?? '',
    },
  },
};
