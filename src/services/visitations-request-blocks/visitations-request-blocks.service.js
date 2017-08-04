// Initializes the `visitations-request-blocks` service on path `/visitations-request-blocks`
const createService = require('feathers-mongodb');
const hooks = require('./visitations-request-blocks.hooks');
const filters = require('./visitations-request-blocks.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = {
    // we use the username of the blocker
    // as the unique identifier for an vs request block info doc
    id: 'blockerUsername',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/visitations-request-blocks', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('visitations-request-blocks');

  mongoClient.then(db => {
    service.Model = db.collection('visitations-request-blocks');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
