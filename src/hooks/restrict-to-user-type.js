// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

/**
* restrict-to-user-type
* This hook restricts access to certain operations based on the "type" of the user
* who has authenticated the request.
* This hook should run immediatly after authentication checking.
* The hook function takes a variable number of objects as a parameter.
* Each object represents a type of user who is valid.
* If the user does not match one of these types, the hook will throw an error.
* If a field is included, for this validType to be matched, the user authenticating the method
* must posess a property with the same field name that matches the value of the field in the `validTypes` array's object.
* If a field is not included, it will be considered a match regardless of the value of the field with that name
* for the user authenticating the request.
*/

// each valid-type object may contain any of the following properties
// they may not contain properties other than these
const SUPPORTED_PROPERTIES = [
  'isStudent',
  'isDayStudent',
  'isDean'
]

const errors = require('feathers-errors');

module.exports = function (...validTypes) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // if nothing is included in the options object, or nothing is included in the validTypes array,
    // exit the hook since there is nothing to restrict based on
    if (!validTypes) { return hook; }

    // check each validType and see if it matches the user who has authenticated
    validTypesLoop: for (let validType of validTypes) {
      // for this validType, check each property included
      for (let fieldName in validType) {
        if (validType.hasOwnProperty(fieldName)) {

          // make sure this property is supported by the function
          let propertySupported = false;
          for (let propertyName of SUPPORTED_PROPERTIES) {
            if (fieldName === propertyName) { propertySupported = true; }
          }
          if (!propertySupported) {
            throw new errors.GeneralError('Server-side error: The property `' + fieldName + '` is not supported by the restrict-to-user-type hook.');
          }

          // NOW check if the field value provided matches that of the authenticated user
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
