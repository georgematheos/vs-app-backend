// Initializes the `visitations-requests` service on path `/visitations-requests`
const createService = require('feathers-mongodb');
const hooks = require('./visitations-requests.hooks');
const filters = require('./visitations-requests.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/visitations-requests', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('visitations-requests');

  mongoClient.then(db => {
    service.Model = db.collection('visitations-requests');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
