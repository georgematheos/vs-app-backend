/**
* configure-view-visitations-requests-query
* Configures the query for a view visitations requests request.
*/

const errors = require('feathers-errors');
const restrictTo = require('./restrict-to');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // make sure the request was formatted properly
    if (!hook.params.query.hostUsername && ! hook.params.query.visitorUsername) {
      throw new errors.BadRequest('Either the hostUsername or visitorUsername field must be included in this request.');
    }
    if (hook.params.query.hostUsername && hook.params.query.visitorUsername) {
      throw new errors.Unprocessable('It is not allowed for both the hostUsername and visitorUsername field to be included in this request; only include one.');
    }

    // get the username that will be used for this request
    const username = hook.params.query.hostUsername || hook.params.query.visitorUsername;

    // make sure the authenticated user is the one whose requests are being looked at
    return restrictTo({ username })(hook); // TODO: TEST ALL THIS STUFF
  };
};
