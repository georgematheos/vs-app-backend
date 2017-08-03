/**
* visitations-restrictions/hooks/format-results
* Formats the results of a find visitations-restrictions request.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    hook.result.restrictedUsers = [];
    let promises = [];

    // for each object containing data about a vs restriction, get the restricted user
    for (let restrictionData of hook.result.data) {
      promises.push(hook.app.service('/users').find({ query: {
        username: restrictionData.username
      }})
      .then(results => {
        if (results.total === 0) {
          throw new errors.GeneralError('In format view vs restrictions hook, the user with the username `' + restrictionData.username + '` could not be found.');
        }

        // add the user to the restrictedUsers array
        let user = results.data[0];
        delete user._id;
        delete user.password;
        user.restrictionsEndTime = restrictionData.endTime; // put on the user when their visitations restrictions end
        hook.result.restrictedUsers.push(user);
      }));
    }

    return Promise.all(promises).then(() => {
      delete hook.result.data;
      return hook;
    });
  };
};
