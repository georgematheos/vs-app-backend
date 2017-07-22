/**
* get-value-from-hook
* This function takes the hook and a specifier for a specific value,
* and returns a promise which resolves to the value specified.
* If the specifier is NOT an object, this will just assume the specifier itself is the value, and return
* a promise that resolves to it.
* However, if the value is an object, or the value needs some logic to be retrieved,
* the specifier should be an object containing a field called `strategy`
* that specifies how the value can be found.
* See the VALID_STRATEGY_VALUES array for more info on valid strategies and the format of the specifier
* object for each.
*/

const VALID_STRATEGY_VALUES = [
  'id', // The hook.id contains the value

  'data', // The hook.data contains the value
  // Another parameter, called `fieldName`, must be included specifying the field within hook.data that contains the value.

  'userField', // The value can be found by retrieving a user object and taking the value of one of its fields
  // Two other parameters must be included:
  // `username` - the user's username; this should be set to another valid specifier
  // `field` - the name of the field from the user to access

  'included' // The value is included in this object.
  // Another parameter, called `value`, must be included, containing the value.
  // Note that if the value is NOT an object, it may simply be used in place of the specifier object.
  // If it is an object, that will not work, and the 'included' strategy must be used
];

const errors = require('feathers-errors');

function getValueFromHook(hook, specifier) {
  // if the specifier is not an object, assume it is instead the correct value to return
  if (typeof specifier !== 'object') {
    return Promise.resolve(specifier);
  }

  let val;
  switch (specifier.strategy) {
    case 'id':
      return Promise.resolve(hook.id);
    case 'data':
      return Promise.resolve(hook.data[specifier.fieldName]);
    case 'userField':
      // query into users object using the provided username
      return getValueFromHook(hook, specifier.username)
      .then(username => hook.app.service('/users').find({ query: { username } }))
      .then(results => {
        // if no user has this username, we cannot resolve to a meaningful value, so return undefined
        if (results.total === 0) {
          console.log('No user with the username `' + username + '` can be found by the get-value-from-hook function, so it is returning the value `undefined`.');
          return undefined;
        }

        // return the value on the user object with the given field
        return getValueFromHook(hook, specifier.field)
        .then(fieldName => results.data[0][fieldName]);
      });
    case 'included':
      return Promise.resolve(specifier.value);
    default:
      // if the strategy isn't recognized, throw an error
      throw new errors.GeneralError('Server-side error: the strategy `' + specifier.strategy + '` is not recognized by the get-value-from-hook function. This strategy was on the following specifier: ' + JSON.stringify(specifier));
  }
}

module.exports = getValueFromHook;
