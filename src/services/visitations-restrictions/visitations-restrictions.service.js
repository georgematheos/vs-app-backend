// Initializes the `visitations-restrictions` service on path `/visitations-restrictions`
const createService = require('feathers-mongodb');
const hooks = require('./visitations-restrictions.hooks');
const filters = require('./visitations-restrictions.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = {
    // we use the username as the unique identifier for a vs restriction object
    id: 'username',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/visitations-restrictions', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('visitations-restrictions');

  mongoClient.then(db => {
    service.Model = db.collection('visitations-restrictions');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
