/**
* visitations-restrictions/hooks/delete-auto-end-timed-event
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // if there is no timed event to end this, just exit hook since there's nothing to delete
    if (!hook.result.automaticEndTimedEventId) { return hook; }

    hook.app.service('/timed-events').remove(hook.result.automaticEndTimedEventId)
    .then(results => {
      console.log('Deleted a timed event for ending visitations restrictions because visitations restrictions were deleted.  Timed event:');
      console.log(results);
    })

    return hook;
  };
};
