// Initializes the `approved-visitors` service on path `/approved-visitors`
const createService = require('feathers-mongodb');
const hooks = require('./approved-visitors.hooks');
const filters = require('./approved-visitors.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/approved-visitors', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('approved-visitors');

  mongoClient.then(db => {
    service.Model = db.collection('approved-visitors');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
