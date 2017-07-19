/**
* restrict-to-users
* This ensures that the authenticated user is one of the valid users specified.
* The hook function takes a variable number of objects as parameters.
* Each object contains information about how to access a value the username of the user may be.
* If the authenticated user's username does not match any of these, an error will be thrown.
* Each object must be formatted as a `specifier` for the `src/lib/get-value-from-hook` function.
* See that file for formatting details.
*/

const errors = require('feathers-errors');
const getValueFromHook = require('../lib/get-value-from-hook');

module.exports = function (...usernameSpecifiers) { // eslint-disable-line no-unused-vars
  return function (hook) {
    usernameSpecifiers = usernameSpecifiers || [];
    let userIsValid = false; // assume username is invalid until we check

    for (let usernameSpecifier of usernameSpecifiers) {
      // get the username using the getValueFromHook function
      let validUsername = getValueFromHook(usernameSpecifier, hook);

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
      throw new errors.NotAuthenticated('The authenticated user may not perform this request.');
    }
    // otherwise, we're good to go
    else {
      return hook;
    }
  };
};
