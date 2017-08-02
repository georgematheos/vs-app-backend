/**
* visitations-restrictions/hooks/delete-auto-end-timed-event
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    hook.app.service('/timed-events').remove(hook.result.automaticEndTimedEventId)
    .then(results => {
      console.log('Deleted a timed event for ending visitations restrictions because visitations restrictions were deleted.  Timed event:');
      console.log(results);
    })

    return hook;
  };
};
