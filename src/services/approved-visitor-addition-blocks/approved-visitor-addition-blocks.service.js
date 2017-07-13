// Initializes the `approved-visitor-addition-blocks` service on path `/approved-visitor-addition-blocks`
const createService = require('feathers-mongodb');
const hooks = require('./approved-visitor-addition-blocks.hooks');
const filters = require('./approved-visitor-addition-blocks.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/approved-visitor-addition-blocks', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('approved-visitor-addition-blocks');

  mongoClient.then(db => {
    service.Model = db.collection('approved-visitor-addition-blocks');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
