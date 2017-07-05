/* eslint-disable no-console */
const logger = require('winston');
const app = require('./app');
const apiApp = require('./apiApp');
const port = app.get('port');

// Start server
const server = app.listen(port);

// Setup api app w/ server.  This was set to be used at the proper route in src/app.js.
// Details about this process can be found at:
// https://github.com/feathersjs/feathers/issues/531 and
// https://github.com/feathersjs/feathers-docs/blob/master/api/express.md#sub-apps
apiApp.setup(server);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info(`Feathers application started on ${app.get('host')}:${port}`)
);
