// Initializes the `vs-request-blocks` service on path `/vs-request-blocks`
const createService = require('feathers-mongodb');
const hooks = require('./vs-request-blocks.hooks');
const filters = require('./vs-request-blocks.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/vs-request-blocks', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('vs-request-blocks');

  mongoClient.then(db => {
    service.Model = db.collection('vs-request-blocks');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
