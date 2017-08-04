/**
* visitations-requests/hooks/configure-expiration
* Configures a timed event to automatically have the vs request expire after 10 minutes.
*/

const initializeTimedEventPerformer = require('../../../lib/initialize-timed-event-performer');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const millisecondsInMinute = 1000 * 60; // milliseconds in 1 minute
    const tenMinutes = 10 * millisecondsInMinute; // milliseconds in 10 minutes
    const currentTime = (new Date()).getTime(); // current time

    const eventTime = currentTime + tenMinutes; // the event should occur in 10 minutes

    // create timed event for deleting visitations request after a fixed amount of time
    hook.app.service('/timed-events') // don't return this; it doesn't have to happen synchronously
    .create({
      type: 1,
      time: eventTime,
      service: 'visitations-requests',
      method: 'remove',
      parameters: [ hook.result._id ] // delete the request with the id of the one just created
    })
    .then(result => {
      hook.service.patch(hook.result._id, {
        expirationTimedEventId: result._id
      });
    });

    return hook;
  };
};
