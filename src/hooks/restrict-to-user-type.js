// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

/**
* restrict-to-user-type
* This hook restricts access to certain operations based on the "type" of the user
* who has authenticated the request.
* This hook should run immediatly after authentication checking.
* The hook function's options object should contain an object with the following property:
* `validTypes`, which should contain an array.
* The `validTypes` array should contain objects with any of the following boolean fields:
* isStudent
* isDayStudent
* isDean
* If a field is included, for this validType to be matched, the user authenticating the method
* must posess a property with the same field name that matches the value of the field in the `validTypes` array's object.
* If a field is not included, it will be considered a match regardless of the value of the field with that name
* for the user authenticating the request.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // if nothing is included in the options object, or nothing is included in the validTypes array,
    // exit the hook since there is nothing to restrict based on
    if (!options.validTypes || options.validTypes.length === 0) { return hook; }

    // check each validType and see if it matches the user who has authenticated
    validTypesLoop: for (let validType of options.validTypes) {
      // for this validType, check each property included
      for (let fieldName in validType) {
        if (validType.hasOwnProperty(fieldName)) {
          // if the authenticated user doesn't have this field, or its value doesn't match,
          // this validType is not a match, so continue the validTypesLoop and check the next validType
          if (hook.params.user[fieldName] !== validType[fieldName]) {
            continue validTypesLoop;
          }
        }
      }
      // if we get here, all fields in validType matched the fields in user
      // that means it is fine to let the user through, so exit the hook
      return hook;
    }

    // if we get here, it means the user did not match any of the validTypes provided
    // this means the user may not perform this operation, so send an errors
    throw new errors.NotAuthenticated('The authenticated user is not of a valid type to perform this request. (Type refers to whether the user is a boarding student, a day student, a non-dean faculty member, or a dean.)');
  };
};
