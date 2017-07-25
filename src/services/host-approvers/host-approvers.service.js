// Initializes the `host-approvers` service on path `/host-approvers`
const createService = require('./host-approvers.class.js');
const hooks = require('./host-approvers.hooks');
const filters = require('./host-approvers.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'host-approvers',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/host-approvers', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('host-approvers');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
