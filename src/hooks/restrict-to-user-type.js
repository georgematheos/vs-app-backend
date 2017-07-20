// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

/**
* restrict-to-user-type
* This hook restricts access to certain operations based on the "type" of the user
* who has authenticated the request.
* This hook should run immediatly after authentication checking.
* The hook function takes a variable number of objects as a parameter.
* Each object is a validType object (as described in `src/lib/user-is-valid-type`) describing a type the user is permitted to be.
*/

const errors = require('feathers-errors');
const userIsValidType = require('../lib/user-is-valid-type');

module.exports = function (...validTypes) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // if nothing is included in the options object, or nothing is included in the validTypes array,
    // exit the hook since there is nothing to restrict based on
    if (!validTypes) { return hook; }

    // if the user is a not a valid type throw an error
    if (!userIsValidType(hook.params.user, validTypes)) {
      throw new errors.NotAuthenticated('The authenticated user is not of a valid type to perform this request. (Type refers to whether the user is a boarding student, a day student, a non-dean faculty member, or a dean.)');
    }

    return hook;
  };
};
