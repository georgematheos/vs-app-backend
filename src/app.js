const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');

const feathers = require('feathers');
const configuration = require('feathers-configuration');

const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');

const apiApp = require('./apiApp');

const app = feathers();

// Load app configuration
app.configure(configuration(path.join(__dirname, '..')));

// Use the api feathers sub-app at the proper url
// Setup completed in index.js; there is also more explaination there.
app.use('/api', apiApp);

// Enable CORS, security, compression, and favicon
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', feathers.static(app.get('public')));

// Configure a middleware for 404s and the error handler
app.use(notFound());
app.use(handler());

module.exports = app;
