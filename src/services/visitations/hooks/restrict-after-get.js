/**
* visitations/hooks/restrict-after-get
* Restricts the get method to only valid users; this is an after hook.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // we are good to go and don't have to do anything special if this user is a dean, a faculty member
    // in the same dorm where Vs occurred, or the host
    if (hook.params.user.isDean) { return hook; }
    if (!hook.params.user.isStudent && hook.params.user.dormitory === hook.result.dormitory) { return hook; }
    if (hook.params.user.username === hook.result.hostUsername) { return hook; }

    // if this is a visitor, note that we may have to remove visitor data
    for (let visitorDatum of hook.result.visitors) {
      if (hook.params.user.username === visitorDatum.username) {
        hook.params.removeVisitorDataIfNotHost = true;
        return hook;
      }
    }

    // if the authenticated user is none of the above, throw an error, since they may not access this data
    throw new errors.NotAuthenticated('The authenticated user may not view information about this visitations session.');
  };
};
