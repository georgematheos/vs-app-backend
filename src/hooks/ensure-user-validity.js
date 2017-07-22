/**
* ensure-user-validity
* This hook ensures that the specified user is valid, and throws an error if they are not.
* The hook function takes a variable number of parameters.
* The first parameter is a specifier (see `src/lib/get-value-from-hook`) that specifies a user object
* for the user to ensure the validity of.
* Each parameter after that is a query object that can be used in `src/lib/check-query-match`.
* This hook checks to make sure that the provided user matches one of the query
* objects provided.  If it does not, an error is thrown.
*/

const errors = require('feathers-errors');
const checkQueryMatch = require('../lib/check-query-match');
const getValueFromHook = require('../lib/get-value-from-hook');

module.exports = function (userSpecifier, ...validQueries) { // eslint-disable-line no-unused-vars
  let username;
  return function (hook) {
    return getValueFromHook(hook, userSpecifier)
    .then(user => {
      username = user.username; // note who the user in questino is
      return checkQueryMatch(hook, user, ...validQueries);
      })
    .then(userIsValid => {
      if (!userIsValid) {
        throw new errors.Forbidden('The user specified in this request with the username `' + username + '` is not valid for their part in the request.');
      }
      return hook;
    });
  };
};
