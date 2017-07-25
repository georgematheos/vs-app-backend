/**
* restrict-to
* This restricts access to this method to users who match a provided query object.
* The hook function takes a variable number of parameters.
* Each parameter is a query object that can be used in `src/lib/check-query-match`.
* This hook checks to make sure that the authenticated user matches one of the query
* objects provided.  If it does not, an error is thrown.
*/

const errors = require('feathers-errors');
const ensureUserValidity = require('./ensure-user-validity');

module.exports = function (...validQueries) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // use the ensureUserValidity hook to do the real thinking here
    // supply the authenticated user as the user to check
    return ensureUserValidity({ strategy: 'authenticated user' }, ...validQueries)(hook)
    .then(hook => hook)
    // if an error is thrown, use our own more specific one instead
    .catch(err => {
      throw new errors.NotAuthenticated('The authenticated user may not perform this request.');
    });
  };
};
