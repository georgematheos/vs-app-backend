/**
* change-field-name
* This hook (which is an AFTER hook) replaces a field on the result (or on the data field of the
* result) with a field that has the same value, but a different name.
* The hook function takes two or three parameters.
* The first is the old name of the field to rename.
* The second is the new name of the field to rename.
* The third is the name of the array containing the objects that need to have a field renamed.
* If the third parameter is not included, the default value is 'data'.
* Also note that is a field is not found on the hook.result with the name specified by the third
* parameter, it will be assumed that the hook.result itself is the object containing the field to be
* renamed.
*/

module.exports = function (oldFieldName, newFieldName, dataName = 'data') { // eslint-disable-line no-unused-vars
  return function (hook) {
    let objs = hook.result[dataName] || [ hook.result ];

    for (let i in objs) {
      // if the old field name is not set, don't overwrite the newFieldName to undefined, just
      // leave it as is; but make note, since this probably shouldn't be happening
      if (objs[i][oldFieldName] === undefined) {
        console.log('The field `' + oldFieldName + '` could not be found on an object in the change-field-name hook.  No modification will be performed on this object.');
        continue;
      }

      objs[i][newFieldName] = objs[i][oldFieldName];
      delete objs[i][oldFieldName];
    }

    if (hook.result[dataName]) {
      hook.result[dataName] = objs;
    }
    else {
      hook.result = objs[0];
    }

    return hook;
  };
};
