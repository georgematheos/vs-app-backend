/**
* restrict-to
* This hook restricts a service method to only certain users.
* The hook function takes a variable number of parameters.
* Each parameter is a query object that can be used in `src/lib/check-query-match`.
* This hook checks to make sure that the authenticated user matches one of the query
* objects provided.  If they do not, an error is thrown.
*/

const errors = require('feathers-errors');
const checkQueryMatch = require('../lib/check-query-match');

module.exports = function (...validQueries) { // eslint-disable-line no-unused-vars
  return function (hook) {
    return checkQueryMatch(hook, hook.params.user, ...validQueries)
    .then(userIsValid => {
      if (!userIsValid) {
        throw new errors.Forbidden('The authenticated user may not perform this request.');
      }
      return hook;
    });
  };
};
