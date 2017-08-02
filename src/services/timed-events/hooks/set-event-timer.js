/**
* timed-events/hooks/set-event-timer
*/

const initializeTimedEventPerformer = require('../../../lib/initialize-timed-event-performer');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    initializeTimedEventPerformer(hook.app, hook.result);
    return hook;
  };
};
