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

// note that these are really hooks for the api
// but the name of the file is still app.hooks.js
// this is so the feathers command line tools work properly
const appHooks = require('./app.hooks');

const app = feathers();

// Load app configuration
// TODO: do we really need to load whole config for both the api app and the root app?
app.configure(configuration(path.join(__dirname, '..')));

// Enable body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// TODO: probably this should be removed before production, or replaced with a fancier logger
// Make note that we made it to the api feathers app
app.use((req, res, next) => {
  console.log("Request has reached the api app.");
  next();
});

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);

// Set up Plugins and providers
app.configure(hooks());
app.configure(rest());
app.configure(socketio());

// configure authentication
app.configure(authentication);

// Set up our services (see `services/index.js`)
app.configure(services);

// Use our hooks
app.hooks(appHooks);

module.exports = app;
