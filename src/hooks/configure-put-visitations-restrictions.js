/**
* configure-put-visitations-restrictions
* Configures a PUT request to the vs restrictions service.
*/

const errors = require('feathers-errors');
const restrictTo = require('./restrict-to');
const ensureUserValidity = require('./ensure-user-validity');
const initializeTimedEventPerformer = require('../lib/initialize-timed-event-performer');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const username = hook.id; // the username of the user to restrict from vs
    const restrictionsEndTime = hook.data.endTime;

    // get the user's user object to check whether they exist, and to find their dorm
    return hook.app.service('/users').find({ query: { username } })
    .then(results => {
      // throw err if user can't be found
      if (results.total === 0) {
        throw new errors.NotFound('A user with username `' + username + '` could not be found.');
      }

      // add the dormitory to the hook data
      const { dormitory } = results.data[0];
      hook.data = { username, dormitory };

      // now, make sure the user is a student
      return ensureUserValidity(
        { strategy: 'included', value: results.data[0] },
        { isStudent: true }
      )(hook)
      // also make sure the person making the request is a dean or fac in user's dorm
      .then(restrictTo(
        { isDean: true }, // dean
        { isStudent: false, dormitory } // faculty member in user's dorm
      )(hook));
    })
    // if a document doesn't exist at this url, switch this to a create request
    .then(() => hook.service.get(username, { $limit: 0 }))
    .then(results => hook)
    // if there is a not found error, swap to create request
    .catch(err => {
      if (err.code !== 404) { throw err; } // if the error isn't a not found error, throw the error

      return hook.service.create(hook.data)
      .then(results => {
        hook.result = results;
      });
    })
    // finally, if the request included a time for the restrictions to end, make a timed event to do
    // this
    .then(() => {
      if (restrictionsEndTime) {
        hook.app.service('/timed-events')
        .create({
          type: 1,
          time: restrictionsEndTime,
          service: 'visitations-restrictions',
          method: 'remove',
          parameters: [ hook.id ]
        })
        .then(result => {
          initializeTimedEventPerformer(hook.app, result);
        });
      }

      return hook;
    });
  };
};
