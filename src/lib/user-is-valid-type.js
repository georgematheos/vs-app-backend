/**
* user-is-valid-type
* This function returns true if the given user object is of a valid type,
* and false if the user is not.
* The first parameter is the user object.
* The second parameter is an array of validType objects.
* Each validType object represents a type the user may be and still be valid.
* For each field on this object, the function will check whether the user's field
* by this name contains the same value.
* If it does not, the user does not match this validType.
* The function will return true if the user matches any valid type,
* and false otherwise.
*/

// each valid-type object may contain any of the following properties
// they may not contain properties other than these
const SUPPORTED_PROPERTIES = [
  'isStudent',
  'isDayStudent',
  'isDean'
];

const errors = require('feathers-errors');

function userIsValidType(user, validTypes) {
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

        // NOW check if the field value provided matches that of the provided user
        // if the user doesn't have this field, or its value doesn't match,
        // this validType is not a match, so continue the validTypesLoop and check the next validType
        if (user[fieldName] !== validType[fieldName]) {
          continue validTypesLoop;
        }
      }
    }
    // if we get here, all fields in validType matched the fields in user
    // that means it is fine to let the user through, so exit the hook
    return true;
  }
  // if we get here and haven't returned true, it means the user didn't match any validType, so return false
  return false;
}

module.exports = userIsValidType;
