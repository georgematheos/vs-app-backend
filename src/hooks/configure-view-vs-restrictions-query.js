/**
* configure-view-vs-restrictions-query
* Configures the query properly for a find vs-restrictions request.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // if this user isn't a dean, we have to limit what restrictions they can see
    if (!hook.params.user.isDean) {
      // if this is a faculty member affiliated with a dorm, they may only see restrictions for
      // students in their dorm
      if (!hook.params.user.isStudent && hook.params.user.dormitory) {
        hook.params.query.dormitory = hook.params.user.dormitory;
      }
      // if this is a student, they may only see vs restrictions for themselved
      else if (hook.params.user.isStudent) {
        hook.params.query.username = hook.params.user.username;
      }
      // in any other case, this user can't access this, so throw an error
      else {
        throw new errors.NotAuthenticated('The authenticated user may not perform this request.');
      }
    }

    return hook;
  };
};
