const path = require('path');
const bodyParser = require('body-parser');

const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');

const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');

const app = feathers();

// Load app configuration
// TODO: do we really need to load whole config for both the api app and the root app?
app.configure(configuration(path.join(__dirname, '..')));

// Enable body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);

// Set up Plugins and providers
app.configure(hooks());
app.configure(rest());
app.configure(socketio());

// Set up our services (see `services/index.js`)
app.configure(services);

// Use our hooks
app.hooks(appHooks);

module.exports = app;
