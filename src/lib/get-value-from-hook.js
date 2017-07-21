/**
* get-value-from-hook
* This function takes the hook and a specifier for a specific value,
* and returns that value.
* If the specifier is NOT an object, this will just assume the specifier itself is the value, and return it.
* However, if the value is an object, or the value needs some logic to be retrieved,
* the specifier should be an object containing a field called `strategy`
* that specifies how the value can be found.
* See the VALID_STRATEGY_VALUES array for more info on valid strategies and the format of the specifier
* object for each.
*/

// NOTE: at the moment I don't actually use this array for anything
const VALID_STRATEGY_VALUES = [
  'id', // The hook.id contains the value

  'data', // The hook.data contains the value
  // Another parameter, called `fieldName`, must be included specifying the field within hook.data that contains the value.

  'included' // The value is included in this object.
  // Another parameter, called `value`, must be included, containing the value.
  // Note that if the value is NOT an object, it may simply be used in place of the specifier object.
  // If it is an object, that will not work, and the 'included' strategy must be used
];

const errors = require('feathers-errors');

function getValueFromHook(hook, specifier) {
  // if the specifier is not an object, assume it is instead the correct value to return
  if (typeof specifier !== 'object') {
    return specifier;
  }

  let val;
  switch (specifier.strategy) {
    case 'id':
      val = hook.id;
      break;
    case 'data':
      val = hook.data[specifier.fieldName];
      break;
    case 'included':
      val = specifier.value;
      break;
    default:
      // if the strategy isn't recognized, throw an error
      throw new errors.GeneralError('Server-side error: the strategy `' + specifier.strategy + '` is not recognized by the get-value-from-hook function.');
  }
  return val;
}

module.exports = getValueFromHook;
