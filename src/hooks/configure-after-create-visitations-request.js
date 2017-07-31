/**
* configure-after-create-visitations-request
* Configures everything necessary after a create visitations request.  Currently, this
* is just setting up timed events for deleting the request after it expires.
*/

const initializeTimedEventPerformer = require('../lib/initialize-timed-event-performer');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const millisecondsInMinute = 1000 * 60; // milliseconds in 1 minute
    const tenMinutes = 10 * millisecondsInMinute; // milliseconds in 10 minutes
    const currentTime = (new Date()).getTime(); // current time

    // TODO: make this 10 mins
    const eventTime = currentTime + 10000; // the event should occur in 10 seconds

    // save info object for deleting Vs request after fixed amount of time
    return hook.app.service('/timed-events')
    .create({
      type: 1,
      time: eventTime,
      service: 'visitations-requests',
      method: 'remove',
      parameters: [ hook.result.id ] // delete the request with the id of the one just created
    })
    // initialize this event to be performed at the right time
    .then(result => {
      initializeTimedEventPerformer(hook.app, result);
      return hook;
    });
  };
};
