/**
* format-view-visitations-requests
* This hook formats the visitations request data for the client.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const users = hook.app.service('/users');

    // rename `data` field to `visitationsRequests`
    hook.result.visitationsRequests = hook.result.data;
    delete hook.result.data;

    let promises = [];

    // for each vs request
    for (let request of hook.result.visitationsRequests) {

      // replace hostUsername with host user object
      promises.push(users.find({ query: { username: request.hostUsername } })
      .then(results => {
        if (results.total === 0) {
          throw new errors.GeneralError('Error: user with the username `' + request.hostUsername + '` was not found.  This error is from the format-view-visitations hook.');
        }

        request.host = results.data[0];
        delete request.host._id;
        delete request.host.password;

        delete request.hostUsername;
      }));

      // replace visitorUsername with visitor user object
      promises.push(users.find({ query: { username: request.visitorUsername } })
      .then(results => {
        if (results.total === 0) {
          throw new errors.GeneralError('Error: user with the username `' + request.visitorUsername + '` was not found.  This error is from the format-view-visitations hook.');
        }

        request.visitor = results.data[0];
        delete request.visitor._id;
        delete request.visitor.password;
        delete request.visitor.roomNumber;

        delete request.visitorUsername;
      }));
    }

    return Promise.all(promises)
    .then(() => hook);
  };
};
