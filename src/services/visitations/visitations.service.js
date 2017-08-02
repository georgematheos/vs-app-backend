// Initializes the `visitations` service on path `/visitations`
const createService = require('feathers-mongodb');
const hooks = require('./visitations.hooks');
const filters = require('./visitations.filters');

module.exports = function () {
  // custom events for this service
  const events = [ 'visitorRemoved' ];

  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { events, paginate };

  // Initialize our service with any options it requires
  app.use('/visitations', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('visitations');

  // set our cuseom events on the service
  service.events = events;

  mongoClient.then(db => {
    service.Model = db.collection('visitations');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
