// Initializes the `vs-restrictions` service on path `/vs-restrictions`
const createService = require('feathers-mongodb');
const hooks = require('./vs-restrictions.hooks');
const filters = require('./vs-restrictions.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/vs-restrictions', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('vs-restrictions');

  mongoClient.then(db => {
    service.Model = db.collection('vs-restrictions');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
