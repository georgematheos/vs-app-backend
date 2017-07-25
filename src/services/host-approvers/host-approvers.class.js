/* eslint-disable no-unused-vars */

/**
* host-approvers
* This service only provides a GET method, which returns
* all users who have added the user specified by ID as an approved visitor.
* This puts the usernames of the users in the response, and a hook should be called later to transform the
* usernames into user objects.
*/

class Service {
  constructor (options) {
    this.options = options || {};
  }

  get (id, params) {
    // search for all approved visitors lists where the user with this ID is an approved visitor
    return this.app.service('/approved-visitors')
    .find({ query: { approvedVisitors: id } })
    .then(results => {
      // the object to be returned will have 2 properties
      let response = {
        approvedVisitorUsername: id, // the username of the approved visitors
        hostApprovers: [] // a list of usernames of host approvers (to be populated)
      };
      // for each result, add a host approver to the list
      for (let result of results.data) {
        response.hostApprovers.push(result.listOwnerUsername);
      }
      return response;
    });
  }

  // save the app object in this object so we can access it
  setup(app) {
    this.app = app;
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
