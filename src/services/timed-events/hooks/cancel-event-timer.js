/**
* timed-events/hooks/cancel-event-timer
*/

const initializeTimedEventPerformer = require('../../../lib/initialize-timed-event-performer');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // if there is a timerId on the hook, get the timer, and cancel it
    if (hook.result.timerId) {
      let timeoutIdObj = hook.app.get('timerIdConverter').getTimerIdObject(hook.result.timerId);
      if (timeoutIdObj) {
        clearTimeout(timeoutIdObj);
      }
    }
  };
};
