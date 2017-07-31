// Initializes the `timed-events` service on path `/timed-events`
const createService = require('feathers-mongodb');
const hooks = require('./timed-events.hooks');
const filters = require('./timed-events.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/timed-events', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('timed-events');

  mongoClient.then(db => {
    service.Model = db.collection('timed-events');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
