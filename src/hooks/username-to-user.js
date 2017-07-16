// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

/**
* username-to-user
* This is an after hook.  It converts usernames in the response
* to user objects.
* It takes a variable number of objects as its parameters.
* Each of these objects may (or must) contain the following fields:
* fieldName -- the current name of the field (required)
* newFieldName -- the name the field should have after this operation (optional; if not included, field name will remain the same)
* fieldsToRemove -- fields that should be removed from the user object that will replace the username.  This should contain an array of strings which are the field names to delete (password will always be deleted)
* Each field specified should either contain a username or an array of usernames.
* Each username (or array of usernames) will be replaced with a user object (or an array thereof).
*/

const errors = require('feathers-errors');

module.exports = function (...fields) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // if no fields to change are included, just return the hook
    if (fields.length === 0) { return hook; }

    let promises = []; // all the promises from searching the users database (we'll add to this later)
    const users = hook.app.service('/users');

    for (let field of fields) {
      let oldFieldName = field.fieldName;
      let newFieldName = field.newFieldName || field.fieldName;

      // if this is an array of usernames
      if (hook.result[oldFieldName].constructor === Array) {
        // for each object in the array
        for (let index in hook.result[oldFieldName]) {
          promises.push(
            // convert a single username to a user object
            singleUsernameToUser(hook.app.service('/users'), hook.result[oldFieldName][index], field.fieldsToRemove)
            .then(user => {
              // set the hook's new field name to equal the user object
              hook.result[newFieldName][index] = user;
            })
          );
        }
      }
      // if this is a string (thus, we'll assume it is the username)
      else if (typeof hook.result[oldFieldName] === 'string') {
        promises.push(
          singleUsernameToUser(hook.app.service('/users'), hook.result[oldFieldName], field.fieldsToRemove)
          .then(user => {
            hook.result[newFieldName] = user;
          })
        );
      }
      // if field specified isn't a string or array, we don't know how to deal with it, so throw an error
      else {
        throw new errors.GeneralError('Server-side failure when converting usernames to user objects. This occurred while attempting to interpret the call to the hook responsible for this, and was most likely caused by incorrect usage by another part of the server.');
      }

      // if the old field name is not the same as the new one,
      // delete the old field from the object
      if (oldFieldName !== newFieldName) {
        delete hook.result[oldFieldName];
      }
    }

    // once all promises collected in our array are finished, resolve with the hook
    return Promise.all(promises).then(() => hook);
  };
};

/**
* singleUsernameToUser
* Given the users service, a username, and fields to remove,
* this returns a promise which resolves to a user object that has had the
* specified fields removed from it.
*/
function singleUsernameToUser(usersService, username, fieldsToRemove) {
  return usersService.find({ query: { username } })
  .then(results => {
    // if we don't get exactly one result, something has gone wrong, so throw an error
    if (results.total !== 1) {
      throw new errors.GeneralError('Server-side failure while converting usernames to user objects. This error occurred while attempting to look up a user with a certain username.');
    }

    return results.data[0]; // return the user object found
  })
  /* remove field names from user that should be removed */
  .then(user => {
    // add password and _id to the fields to delete -- we always want to remove them
    fieldsToRemove = fieldsToRemove || [];
    fieldsToRemove.push('password');
    fieldsToRemove.push('_id');

    // delete all specified fields
    for (let fieldToRemove of fieldsToRemove) {
      delete user[fieldToRemove];
    }

    return user;
  });
}
