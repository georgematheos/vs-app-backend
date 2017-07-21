/**
* restrict-to
* This hook restricts a service method to only certain users.
* The hook function takes a variable number of parameters.
* Each parameter is a query object that can be used in `src/lib/matches-query`.
* This hook checks to make sure that the authenticated user matches one of the query
* objects provided.  If they do not, an error is thrown.
*/

const errors = require('feathers-errors');
const matchesQuery = require('../lib/matches-query');

module.exports = function (...validQueries) { // eslint-disable-line no-unused-vars
  return function (hook) {
    if (!matchesQuery(hook, hook.params.user, ...validQueries)) {
      throw new errors.Forbidden('The authenticated user may not perform this request.');
    }

    return hook;
  };
};
