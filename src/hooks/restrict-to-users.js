/**
* restrict-to-users
* This ensures that the authenticated user is one of the valid users specified.
* The hook function takes a variable number of strings as parameters.
* Each object contains information about how to access a value the username of the user may be.
* If the authenticated user's username does not match any of these, an error will be thrown.
* Each object must contain the field `stragety`, which is the way that the hook may find the
* username.  For the valid values of this field, see the array below.
*/
// NOTE: at the moment I don't actually use this array for anything
const VALID_STRATEGY_VALUES = [
  'id', // The hook.id contains the username
  'data', // The hook.data contains the username. Another parameter, called `fieldName`, must be included specifying the field within hook.data that contains the username.
  'included' // The username is included in this object.  Another parameter, called `value`, must be included, containing the username.
]

const errors = require('feathers-errors');

module.exports = function (...usernameSpecifiers) { // eslint-disable-line no-unused-vars
  return function (hook) {
    usernameSpecifiers = usernameSpecifiers || [];
    let userIsValid = false; // assume username is invalid until we check

    for (let usernameSpecifier of usernameSpecifiers) {
      // get the username, using a different technique depending on the strategy
      let validUsername;
      switch (usernameSpecifier.strategy) {
        case 'id':
          validUsername = hook.id;
          break;
        case 'data':
          validUsername = hook.data[usernameSpecifier.fieldName];
          break;
        case 'included':
          validUsername = usernameSpecifier.value;
          break;
        default:
          // if the strategy isn't recognized, throw an error
          throw new errors.GeneralError('Server-side error: the strategy `' + usernameSpecifier.strategy + '` passed into the restrict-to-users hook is not recognized.');
      }
      // if the username is still undefined, something went wrong, so consider this username invalid and log that something is an issue
      if (!validUsername) {
        console.log('The restrict-to-users hook was unable to find a username specified using the strategy `' + usernameSpecifier.strategy + '`.  Will proceed as though this username specifier had not been passed into hook.');
        continue; // continue loop, since this username is invalid
      }

      // if this username matches the authenticated user's, the user is valid
      if (hook.params.user.username === validUsername) {
        userIsValid = true;
        break; // no need to continue with the loop
      }
    }

    // if the user is not valid, throw an error
    if (!userIsValid) {
      throw new errors.NotAuthenticated('The authenticated user may not perform this request.')
    }
    // otherwise, we're good to go
    else {
      return hook;
    }
  };
};
