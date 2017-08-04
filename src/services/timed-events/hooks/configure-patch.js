/**
* timed-events/hooks/configure-patch
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    hook.params.setTimer = true; // assume that we will want to update the timer after this modification

    // the only field allowed to be changed by a patch request is the 'time' field
    // (or the `timer` field, which will be changed in an after hook when the new timer is set for the new time)
    // if another field is being modified, the event isn't really the same, so a new timed-event should be created

    // check every field on hook.data
    for (let fieldName in hook.data) {
      if (hook.data.hasOwnProperty(fieldName)) {
        // if this field is not called 'time', throw an error
        if (fieldName !== 'time' && fieldName !== 'timerId') {
          throw new errors.GeneralError('Server-side error: The only field the timed-events service\'s patch method may be used to modify is the `time` field.  The `' + fieldName + '` field may not be modified.  If any other field is being changed, it isn\'t really the same event any more, so another timed-event should be created, rather than modifying one that already exists.');
        }

        // if we are modifying the timerId, a timer must already be set, so we don't actually want to set a timer again
        if (fieldName === 'timerId') {
          hook.params.setTimer = false;
        }
      }
    }

    return hook;
  };
};
