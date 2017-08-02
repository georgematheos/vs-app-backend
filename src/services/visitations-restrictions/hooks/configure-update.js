/**
* visitations-restrictions/hooks/configure-update
* Configures a PUT request to the vs restrictions service.
*/

const errors = require('feathers-errors');
const restrictTo = require('../../../hooks/restrict-to');
const ensureUserValidity = require('../../../hooks/ensure-user-validity');
const initializeTimedEventPerformer = require('../../../lib/initialize-timed-event-performer');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const timedEvents = hook.app.service('/timed-events');
    let createTimedEvent = false; // whether we have to create a new timed event; start assuming no

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
    // if a document doesn't exist restricting this user, switch this to a create request
    .then(() => hook.service.find({ query: { username, $limit: 0 } }))
    .then(results => {
      // if a document exists, this should be a normal PUT request
      if (results.total > 0) {
        // if restrictions are set to end at a time, make sure the timed event is for that time
        if (restrictionsEndTime) {
          // see if a timed event to remove this request already exists
          return timedEvents.find({
            type: 1, service: 'visitations-restrictions', method: 'remove', parameters: [ hook.id ]
          })
          .then(results => {
            // if there is currently no timed event set, get out of this .then, but we will have to
            // create a timed event later
            if (results.total === 0) {
              createTimedEvent = true;
              return;
            }
            // if there is currently a timed event, update it with the new endTime
            else {
              timedEvents.patch(results.data[0]._id, {
                time: restrictionsEndTime
              })
              .then(result => {
                initializeTimedEventPerformer(hook.app, result);
              });
            }
          });
        }
      }

      // if we get here, no document exists, so convert this to a create request
      return hook.service.create(hook.data)
      .then(results => {
        hook.result = results;

        // if there is an end time specified, we will have to create a timed event
        if (restrictionsEndTime) { createTimedEvent = true; }
      });
    })
    .then(() => {
      // if we're supposed to create a timed event, do so
      if (createTimedEvent) {
        timedEvents.create({
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

      // return the hook
      return hook;
    });
  };
};
