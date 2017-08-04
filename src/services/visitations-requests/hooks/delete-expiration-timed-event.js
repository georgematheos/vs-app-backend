/**
* visitations-requests/hooks/delete-expiration-timed-event
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // there will be some delete requests that won't have this id on it, and that's fine, but
    // this hook doesn't have to do anything in that case
    if (!hook.params.expirationTimedEventId) { return hook; }

    hook.app.service('/timed-events')
    .remove(hook.params.expirationTimedEventId)
    .then(result => {
      console.log('Deleted a timed event for a visitations request expiration, since the visitations request document was deleted.  Timed event:');
      console.log(result);
    });
  };
};
