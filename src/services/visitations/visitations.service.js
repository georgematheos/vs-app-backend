// Initializes the `visitations` service on path `/visitations`
const createService = require('feathers-mongodb');
const hooks = require('./visitations.hooks');
const filters = require('./visitations.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/visitations', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('visitations');

  mongoClient.then(db => {
    service.Model = db.collection('visitations');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
