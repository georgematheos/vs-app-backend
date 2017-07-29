/**
* prevent-blocked-vs-request-creation
* This throws an error if the Vs request which is about to be created is not allowed due
* to a vs request block.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // check if the host has blocked the visitor from sending them vs requests
    return hook.app.service('vs-request-blocks').find({ query: {
      blockerUsername: hook.data.hostUsername,
      blockees: hook.data.visitorUsername,
      $limit: 0
    } })
    .then(results => {
      // if there is a vs request block in place, throw an error
      if (results.total > 0) {
        throw new errors.Forbidden('The user with the username `' + hook.data.hostUsername + '` has blocked the user with the username `' + hook.data.visitorUsername + '` from sending them visitations requests.');
      }

      return hook;
    })
  };
};
