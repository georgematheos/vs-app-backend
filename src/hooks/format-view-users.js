/**
* format-view-users
* Formats users objects after a get or find request.
* Currently, all this hook does is add the field currentlyOnVsRestrictions to the result.
*/

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // we either have an array of user objects in hook.result.data, or the hook.result is a
    // user object.  either way, put it in a users array
    let users = hook.result.data || [ hook.result ];
    let promises = [];

    // for each index in the array
    for (let i in users) {
      // if this user isn't a student, this field has no meaningful value, so set it to null,
      // and don't make any db queries; just continue to next user
      if (!users[i].isStudent) {
        users[i].currentlyOnVsRestrictions = null;
        continue;
      }

      // if it is a student, check if the user is on vs restrictions
      promises.push(hook.app.service('/vs-restrictions')
      .get(users[i].username, { $limit: 0 })
      .then(() => {
        // if on vs restrictions, make note
        users[i].currentlyOnVsRestrictions = true;
      })
      .catch(err => {
        if (err.code !== 404) { throw err; }
        // if not on vs restrictions, make note
        users[i].currentlyOnVsRestrictions = false;
      }));
    }

    return Promise.all(promises).then(() => {
      // either set the hook.result.data to the users array, or just hook.result to the
      // one user object, depending on which must be done
      if (hook.result.data) {
        hook.result.data = users;
      }
      else {
        hook.result = users[0];
      }

      return hook;
    });

  };
};
