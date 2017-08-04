// Initializes the `timed-events` service on path `/timed-events`
const createService = require('feathers-mongodb');
const hooks = require('./timed-events.hooks');
const filters = require('./timed-events.filters');

const initializeAllTimedEventPerformers = require('../../lib/initialize-all-timed-event-performers');
const timerIdConverter = require('../../lib/timer-id-converter');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/timed-events', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('timed-events');

  // collect all the promises for setting up this service, so we know when it is ready to be used
  let serviceSetupPromises = [
    mongoClient.then(db => {
      service.Model = db.collection('timed-events');
    }),
    service.hooks(hooks),
    // store the timer id converter on the app so it can be accessed
    app.set('timerIdConverter', timerIdConverter)
  ];

  if (service.filter) {
    serviceSetupPromises.push(service.filter(filters));
  }

  // once the service is set up, set up all the timed events that are stored to be run at the right
  // time
  Promise.all(serviceSetupPromises)
  .then(() => {
    initializeAllTimedEventPerformers(app);
  });
};
