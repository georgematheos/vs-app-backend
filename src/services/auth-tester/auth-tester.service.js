// Initializes the `auth-tester` service on path `/auth-tester`
const createService = require('feathers-nedb');
const createModel = require('../../models/auth-tester.model');
const hooks = require('./auth-tester.hooks');
const filters = require('./auth-tester.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'auth-tester',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/auth-tester', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('auth-tester');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
