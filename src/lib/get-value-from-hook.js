/**
* get-value-from-hook
* This function takes the hook and a specifier for a specific value,
* and returns that value.
* The specifier should contain a field called `strategy` that specifies how the value can be found.
* See the VALID_STRATEGY_VALUES array for more info on valid strategies and the format of the specifier
* object for each.
*/

// NOTE: at the moment I don't actually use this array for anything
const VALID_STRATEGY_VALUES = [
  'id', // The hook.id contains the username
  'data', // The hook.data contains the username. Another parameter, called `fieldName`, must be included specifying the field within hook.data that contains the username.
  'included' // The username is included in this object.  Another parameter, called `value`, must be included, containing the username.
];

const errors = require('feathers-errors');

function getValueFromHook(specifier, hook) {
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
      throw new errors.GeneralError('Server-side error: the strategy `' + specifier.strategy + '` passed into a hook is not recognized.');
  }
  return val;
}

module.exports = getValueFromHook;
