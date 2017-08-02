/**
* visitations-results/hooks/format-results
* This hook formats the visitations request data for the client.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const users = hook.app.service('/users');

    // the requests are either in the hook.result.data array, or the hook.result is just one request
    let requests = hook.result.data || [ hook.result ];

    let promises = [];

    // for each vs request
    for (let request of requests) {

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
    .then(() => {
      // if a data field is included, it means we are returning a whole array, so change this name
      // and send the array
      if (hook.result.data) {
        delete hook.result.data;
        hook.result.visitationsRequests = requests;
      }
      // if data field is not included, then return just the one request
      else {
        hook.result = requests[0];
      }

      return hook;
    });
  };
};
